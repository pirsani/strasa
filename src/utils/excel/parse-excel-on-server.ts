import { fileTypeFromBuffer } from "file-type";

export interface ParseExcelOptions {
  extractFromColumns: string[];
  sheetName?: string;
  range?: string; // Optional range of cells
}

export interface ParseExcelResult {
  rows: Record<string, any>[];
  missingColumns: string[];
  emptyValues: Record<number, string[]>; // Row index and columns with empty values
}

/**
 * Parses an Excel file on the server.
 *
 * @param {File} file - The Excel file to be parsed.
 * @param {ParseExcelOptions} options - Options for parsing the Excel file.
 * @param {string[]} options.extractFromColumns - The columns that are allowed to be parsed.
 * @param {string} [options.sheetName] - The name of the sheet to be parsed.
 * @param {string} [options.range] - The optional range of cells to be parsed.
 * @returns {Promise<ParseExcelResult>} A promise that resolves to the result of parsing the Excel file.
 * @throws {Error} If the provided input is not a file or if allowed columns are not provided or empty.
 */
const parseExcelOnServer = async (
  file: Buffer | File,
  options: ParseExcelOptions
): Promise<ParseExcelResult> => {
  if (!options.extractFromColumns || options.extractFromColumns.length === 0) {
    throw new Error("Allowed columns must be provided and cannot be empty.");
  }

  const missingColumns: string[] = [];
  const emptyValues: Record<number, string[]> = {};

  let buffer: Buffer;

  if (file instanceof Buffer) {
    buffer = file;
  } else {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  try {
    // Detect the file type
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) {
      throw new Error("Unable to detect file type.");
    } else if (
      fileType.mime !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      throw new Error("Invalid file type. Only .xlsx files are supported.");
    }

    
    // Dynamically import the xlsx library
    const { read, utils } = await import('xlsx');
    // Parse the file using XLSX
    const workbook = read(buffer, { type: "buffer" });
    const sheetName = options.sheetName || workbook.SheetNames[0];
    const { extractFromColumns } = options;

    console.log(`Parsing sheet: ${sheetName}`);

    const rawData = utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
      header: 1, // Read raw rows as arrays
      range: options.range || undefined,
    }) as unknown[]; // Cast to unknown[] for type safety

    // Extract headers from the first row
    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1) as any[];

    // Identify missing columns
    const actualColumns = headers;
    missingColumns.push(
      ...extractFromColumns.filter((col) => !actualColumns.includes(col))
    );

    // Filter columns based on allowed columns
    const filteredRows = dataRows.map((row: Record<string, any>[]) => {
      const rowObject: Record<string, any> = {};
      extractFromColumns.forEach((col, index) => {
        const colIndex = headers.indexOf(col);
        if (colIndex >= 0 && colIndex < row.length) {
          rowObject[col] = row[colIndex];
        }
      });
      return rowObject;
    });

    // Remove rows where all values are empty
    const validRows = filteredRows.filter((row) =>
      extractFromColumns.some(
        (col) => row[col] !== "" && row[col] !== undefined
      )
    );

    // Identify rows with empty values
    validRows.forEach((row, rowIndex) => {
      const emptyColumns = extractFromColumns.filter(
        (col) => row[col] === "" || row[col] === undefined
      );
      if (emptyColumns.length > 0) {
        emptyValues[rowIndex] = emptyColumns;
      }
    });

    console.log(`[parseExcelOnServer] Parsed ${validRows.length} rows`);

    return {
      rows: validRows,
      missingColumns,
      emptyValues,
    };
  } catch (error) {
    console.error("Error parsing the file:", error);
    throw error;
  }
};

export default parseExcelOnServer;
