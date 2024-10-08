interface ParseExcelOptions {
  extractFromColumns: string[];
  sheetName?: string;
  range?: string; // Optional range of cells
}

export interface ParseExcelResult {
  rows: Record<string, any>[];
  missingColumns: string[];
  emptyValues: Record<number, string[]>; // Row index and columns with empty values
}

const parseExcel = async (
  file: File,
  options: ParseExcelOptions
): Promise<ParseExcelResult> => {
  if (!options.extractFromColumns || options.extractFromColumns.length === 0) {
    throw new Error("Allowed columns must be provided and cannot be empty.");
  }

  const missingColumns: string[] = [];
  const emptyValues: Record<number, string[]> = {};

  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Dynamically import the xlsx library
    const { read, utils } = await import('xlsx');

    const workbook = read(data, { type: "array" });
    const sheetName = options.sheetName || workbook.SheetNames[0];
    const { extractFromColumns } = options;

    // Read and parse the worksheet
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
    const filteredRows = dataRows.map((row: any[]) => {
      const rowObject: Record<string, any> = {};
      extractFromColumns.forEach((col, index) => {
        const colIndex = headers.indexOf(col);
        if (colIndex >= 0 && colIndex < row.length) {
          rowObject[col] = row[colIndex];
        }
      });

      return rowObject;
    });

    // Filter out rows where all values are empty in the allowed columns
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

    console.log(`[parseExcel] Parsed ${validRows.length} rows`);
    console.log("[parseExcel] Missing Columns:", missingColumns);
    console.log("[parseExcel] Empty Values in Rows:", emptyValues);

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

export default parseExcel;
