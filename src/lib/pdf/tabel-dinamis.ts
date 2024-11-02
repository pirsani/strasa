import { once } from "events";
import path from "path";
import PDFDocument from "pdfkit"; // Importing PDFDocument as a value
import { Logger } from "tslog";
import formatCurrency from "../../utils/format-currency";

const logger = new Logger({
  //hideLogPositionForProduction: true,
});

export interface TableColumnHeader {
  header: string;
  headerNumberingString?: string;
  field?: String;
  isSummable?: boolean; // Indicates if the column values can be summed
  format?: "number" | "currency" | "date";
  currency?: "IDR" | "USD" | "EUR";
  level: number;
  width: number;
  align: "left" | "center" | "right";
  subHeader?: TableColumnHeader[];
}

export interface TableRow {
  [key: string]: string | number;
}

// Function to add underlined text with correct alignment
const addUnderline = (
  doc: InstanceType<typeof PDFDocument>,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize?: number;
    underlineColor?: string;
    width?: number;
    align?: "left" | "center" | "right";
  } = {}
) => {
  const {
    fontSize = 12,
    underlineColor = "black",
    width = 100, // Default width in case width is not provided
    align = "left",
  } = options;

  // Measure text width
  const textWidth = doc.widthOfString(text);

  // Adjust x position based on alignment
  let adjustedX = x;
  if (align === "center") {
    adjustedX = x + (width - textWidth) / 2; // Center align
  } else if (align === "right") {
    adjustedX = x + (width - textWidth); // Right align
  }

  // Calculate underline position
  const underlineY = y + fontSize - 1; // Position underline slightly below text

  // Draw underline
  doc
    .moveTo(adjustedX, underlineY)
    .lineTo(adjustedX + textWidth, underlineY)
    .stroke(underlineColor);
};

const justifyBetween = (
  fullValue: string, // This should contain the currency symbol and numeric value, e.g., 'Rp 919.099'
  width: number,
  fontSize: number,
  doc: InstanceType<typeof PDFDocument>
) => {
  // add space 10
  const space = -10;
  try {
    // Set the font size before measuring the width of the space character
    doc.fontSize(fontSize);

    // Use a regular expression to split the currency symbol from the value
    const match = fullValue.match(/^([^\d\s]+)\s*(\d.+)$/);

    if (!match) {
      throw new Error(
        "Invalid format for value: must include a currency symbol and numeric value."
      );
    }

    const currencySymbol = match[1]; // e.g., 'Rp'
    const value = match[2]; // e.g., '919.099'

    // Measure the width of the space character, the value, and the currency symbol
    const spaceWidth = doc.widthOfString(" ");
    const valueWidth = doc.widthOfString(value);
    const currencySymbolWidth = doc.widthOfString(currencySymbol);

    // Calculate the available width for inserting spaces between the currency symbol and the value
    const availableWidth = space + width - (valueWidth + currencySymbolWidth);

    // If the available width is negative or zero, return the currency symbol and value with no extra spacing
    if (availableWidth <= 0) return `${currencySymbol} ${value}`;

    // Calculate how many spaces can fit in the available width
    const totalSpaces = Math.floor(availableWidth / spaceWidth);

    // Build the final spread value by inserting the spaces between the currency symbol and the value
    let spreadValue = `${currencySymbol}${" ".repeat(totalSpaces)}${value}`;

    return spreadValue;
  } catch (error) {
    console.error("Error in spreadValueAcrossWidth:", error);
    throw error;
  }
};

const getColumnXOffset = (
  tableColumnHeaders: TableColumnHeader[],
  index: number
) => {
  return tableColumnHeaders
    .slice(0, index)
    .reduce((acc, col) => acc + col.width, 0);
};

const getTotalTableWidth = (tableColumnHeaders: TableColumnHeader[]) => {
  return tableColumnHeaders.reduce((acc, col) => acc + col.width, 0);
};

const findMaxLevel = (tableColumnHeaders: TableColumnHeader[]): number => {
  let maxLevel = 0;

  for (const column of tableColumnHeaders) {
    // Check the current column's level
    if (column.level > maxLevel) {
      maxLevel = column.level;
    }

    // Recursively check subheaders if they exist
    if (column.subHeader && column.subHeader.length > 0) {
      const subMaxLevel = findMaxLevel(column.subHeader);
      if (subMaxLevel > maxLevel) {
        maxLevel = subMaxLevel;
      }
    }
  }

  return maxLevel;
};

const getDeepestColumns = (
  tableColumnHeaders: TableColumnHeader[]
): TableColumnHeader[] => {
  let deepestColumns: TableColumnHeader[] = [];

  const traverse = (column: TableColumnHeader) => {
    if (!column.subHeader || column.subHeader.length === 0) {
      deepestColumns.push(column);
    } else {
      column.subHeader.forEach((subColumn) => traverse(subColumn));
    }
  };

  tableColumnHeaders.forEach((column) => traverse(column));
  return deepestColumns;
};

const isHasSubHeader = (column: TableColumnHeader): boolean => {
  return !!(column.subHeader && column.subHeader.length > 0);
};

// Updated drawCell function
export const drawCell = (
  doc: InstanceType<typeof PDFDocument>,
  text: string,
  x: number,
  y: number,
  width: number,
  align: "left" | "center" | "right",
  fontSize: number = 8, // Default font size value
  padding: number = 5, // Default padding value
  lineSpacing: number = 5, // Default line spacing value
  underline: boolean = false // New parameter to decide whether to underline text
) => {
  const adjustedX = x + padding; // Add horizontal padding if needed
  const adjustedWidth = width - 2 * padding;
  const adjustedY = y + padding; // Add vertical padding if needed

  const lines = text.split("\n");
  let currentY = adjustedY;

  lines.forEach((line) => {
    // Draw regular text
    doc.fontSize(fontSize).text(line, adjustedX, currentY, {
      width: adjustedWidth,
      align: align,
    });

    // Add underline if required
    if (underline) {
      addUnderline(doc, line, adjustedX, currentY, {
        fontSize,
        underlineColor: "black", // Set underline color or pass as a parameter
        width: adjustedWidth, // Use the cell width
        align, // Use the same alignment as the text
      });
    }

    // Update currentY to account for line spacing
    currentY +=
      doc.heightOfString(line, { width: adjustedWidth }) + lineSpacing;
  });
};

const generateTableHeader = (
  doc: InstanceType<typeof PDFDocument>,
  tableColumnHeaders: TableColumnHeader[],
  startX: number,
  startY: number,
  rowHeight: number = 25
) => {
  logger.info("[generateTableHeader START at x,y]", startX, startY);

  // find max level recursively
  const maxLevel = findMaxLevel(tableColumnHeaders);

  const drawHeader = (
    tableColumnHeaders: TableColumnHeader[],
    startX: number,
    startY: number
  ) => {
    tableColumnHeaders.forEach((column, index) => {
      const columnXOffset = getColumnXOffset(tableColumnHeaders, index);
      const columnStartX = startX + columnXOffset;
      const columnStartY = startY + rowHeight;

      // Draw the header text
      drawCell(
        doc,
        String(column.header),
        columnStartX,
        columnStartY,
        column.width,
        "center" //column.align always center
      );

      // check if column has subheader
      const hasSubHeader = isHasSubHeader(column);

      //console.log(`[hasSubHeader] ${column.header} `, hasSubHeader);
      const columnRowHeight = hasSubHeader
        ? rowHeight
        : (maxLevel - column.level) * rowHeight + rowHeight;

      doc
        .rect(columnStartX, columnStartY, column.width, columnRowHeight)
        .stroke();

      // If the column has subheaders, draw them recursively
      if (column.subHeader) {
        drawHeader(column.subHeader, columnStartX, columnStartY);
      }
    });
  };

  // Start drawing the header
  drawHeader(tableColumnHeaders, startX, startY);

  // Draw the border around the header
  logger.info("[generateTableHeader END]");
};

const generateTableRow = (
  doc: InstanceType<typeof PDFDocument>,
  row: TableRow,
  tableColumnHeaders: TableColumnHeader[],
  startX: number,
  y: number,
  rowHeight: number = 25
) => {
  console.log("\n ======================================================== \n");
  logger.info(
    "[generateTableRow START startX, y, rowHeight]",
    startX,
    y,
    rowHeight
  );
  logger.debug("[generateTableRow] row", row);
  const drawRow = (
    row: TableRow,
    tableColumnHeaders: TableColumnHeader[],
    startX: number,
    y: number,
    rowHeight: number
  ) => {
    Object.entries(row).forEach(([key, value]) => {
      const column = tableColumnHeaders.find((column) => column.field === key);
      if (!column) {
        return;
      }

      const columnXOffset = getColumnXOffset(
        tableColumnHeaders,
        tableColumnHeaders.indexOf(column)
      );
      const columnStartX = startX + columnXOffset;

      let val = String(value);
      if (column.format === "currency") {
        const currValue = formatCurrency(
          value as number,
          "id-ID",
          column.currency
        );
        // Spread value across column width if needed to fit the text Rp 1.000.000,00 -> Rp   1.000.000,00
        val = justifyBetween(String(currValue), column.width, 8, doc);
      }

      drawCell(doc, val, columnStartX, y, column.width, column.align, 8, 5, 5);

      doc.rect(columnStartX, y, column.width, rowHeight).stroke();
      // console.log("columnY shouldbe", y + rowHeight);
      // console.log("[x,y]", doc.x, doc.y);
    });
  };

  drawRow(row, tableColumnHeaders, startX, y, rowHeight);
};

export interface DataGroup {
  nama: string; // nama group
  groupMembers: TableRow[]; // TableRow[] ini dari DataGroupNarasumber
}

const generateTable = (
  doc: InstanceType<typeof PDFDocument>,
  tableColumnHeaders: TableColumnHeader[],
  tableData: DataGroup[],
  startX: number,
  startY: number,
  startYonFirstPage: number,
  headerRowHeight: number = 25,
  dataRowHeight: number = 25
) => {
  logger.info("===generateTable===");
  const deepestColumns = getDeepestColumns(tableColumnHeaders);
  const maxLevel = findMaxLevel(tableColumnHeaders);
  const totalHeightHeader = maxLevel * headerRowHeight;
  const availableHeight = doc.page.height - 60;

  // count total width
  const totalWidth = getTotalTableWidth(deepestColumns);

  logger.info("[PREPARATION DONE]");

  // generate table header for page 1
  generateTableHeader(
    doc,
    tableColumnHeaders,
    startX,
    startYonFirstPage,
    headerRowHeight
  );

  const heightDivider = 15;
  // generate table row
  // untuk halaman 2 dan selanjutnya
  let controlBaseStartYOnFirstPage =
    startYonFirstPage + headerRowHeight + totalHeightHeader;
  let controlBaseStartY = startY + headerRowHeight + totalHeightHeader;
  let controlStartYRowgroupMembers = controlBaseStartY;
  let dataGroupIterator = 0;
  let rowIterator = 0;
  let page = 1;
  let rowCounterOnPage = 0;

  // iterate dataGroup
  tableData.forEach((dataGroup, dataGroupIndex) => {
    logger.info("[tableData ITERATE dataGroupIndex]", dataGroupIndex);

    console.log("\n");
    console.log("[page]", page);
    console.log(
      "[dataGroupIterator,dataGroupIndex ]",
      dataGroupIterator,
      dataGroupIndex
    );
    let length = 0;
    if (dataGroupIndex !== 0) {
      length = tableData[dataGroupIndex - 1].groupMembers.length;
    }
    const totalHeightRow = rowCounterOnPage * dataRowHeight;

    // base start untuk tabel halaman 1 berbeda dengan halaman 2 dst
    const controlBaseY =
      page === 1 ? controlBaseStartYOnFirstPage : controlBaseStartY;
    let baseStartY = controlBaseY + totalHeightRow; // gradualle increase baseStartY

    console.log(
      "[page] startY totalHeightHeader baseStartY",
      page,
      startY,
      totalHeightHeader,
      baseStartY
    );

    // divider row dengan nama kelas

    const isNewPageNeeded = baseStartY > availableHeight;

    if (isNewPageNeeded) {
      logger.info("[isNewPageNeeded-1-yes]", isNewPageNeeded);

      // reset startY
      rowCounterOnPage = 0;
      dataGroupIterator = 0;

      // generate sum row before new page

      doc.addPage(); // new page
      page++;
      console.log("[NEW PAGE] on new divider", page);
      baseStartY = controlBaseStartY; // reset baseStartY on new page
      generateTableHeader(
        doc,
        tableColumnHeaders,
        startX,
        startY,
        headerRowHeight
      );
    } else {
      //console.log("[CONTINUE]", dataGroupIndex);
      logger.info("[isNewPageNeeded-1-no]", isNewPageNeeded);
    }

    let rowReset = false;

    // Iterate and generate row for each groupMembers
    // calculate subSumRow
    dataGroup.groupMembers.forEach((groupMembers, rowIndex) => {
      console.log("#########################################################");

      let startYDynamic = baseStartY + dataRowHeight * rowCounterOnPage;
      logger.debug("[rowIndex rowCounterOnPage]", rowIndex, rowCounterOnPage);
      logger.debug(
        "[beforeRowReset] startYDynamic = baseStartY + dataRowHeight * rowCounterOnPage;",
        startYDynamic,
        baseStartY,
        dataRowHeight,
        rowIndex
      );

      if (rowReset) {
        startYDynamic = controlStartYRowgroupMembers + dataRowHeight;
        logger.info("[rowReset] startYDynamic", startYDynamic);
      }

      const isNewPageNeeded = startYDynamic + dataRowHeight > availableHeight;
      if (isNewPageNeeded) {
        logger.info("[isNewPageNeeded-2-yes]", rowCounterOnPage);

        rowCounterOnPage = 0;
        rowIterator = 0;
        dataGroupIterator = 0;
        rowReset = true;

        // generate sum row before new page

        doc.addPage(); // new page
        page++;
        //console.log("[NEW PAGE] on new row", page);

        // reset startY
        startYDynamic = controlBaseStartY;
        baseStartY = controlBaseStartY; // reset baseStartY on new page
        generateTableHeader(
          doc,
          tableColumnHeaders,
          startX,
          startY,
          headerRowHeight
        );
      } else {
        logger.info("[isNewPageNeeded-2-no]", rowCounterOnPage);

        rowIterator++;
        rowReset = false;
      }

      logger.info("[BEFORE generateTableRow]", rowCounterOnPage);
      logger.debug(
        "[rowCounterOnPage rowIterator]",
        rowCounterOnPage,
        rowIterator
      );

      generateTableRow(
        doc,
        groupMembers,
        deepestColumns,
        startX,
        startYDynamic,
        dataRowHeight
      );

      logger.info("[AFTER generateTableRow]", rowCounterOnPage);

      // if last row, generate sum row
      if (
        dataGroupIndex === tableData.length - 1 &&
        rowIndex === dataGroup.groupMembers.length - 1
      ) {
        const lastY = startYDynamic + dataRowHeight;
        // setelah row terakhir perlu footer yang berisi tanggal dan ttd
        // maka jika tidak cukup tinggi, maka perlu new page
        const isNewPageNeeded = lastY + 80 > availableHeight; // 80 = footer height

        console.log("isNewPageNeeded", isNewPageNeeded);
        if (isNewPageNeeded) {
          doc.addPage(); // new page
          page++;
          console.log("[NEW PAGE] on last row", page);
          // reset startY
          startYDynamic = controlBaseStartY;
          baseStartY = controlBaseStartY;
          // generateTableHeader(
          //   doc,
          //   tableColumnHeaders,
          //   startX,
          //   startY,
          //   headerRowHeight
          // );
        }
      }

      rowCounterOnPage++;
    });

    dataGroupIterator++;
  });
};

export const generateReportHeader = (
  doc: InstanceType<typeof PDFDocument>,
  satker: string = "",
  headerText: string = "",
  subHeaderText: string = ""
) => {
  drawCell(
    doc,
    `${satker} \n Kementerian Luar Negeri`,
    25,
    25,
    200,
    "center",
    12,
    0,
    0
  );

  doc.moveDown();

  doc.fontSize(11).text(headerText, { align: "center" });
  doc.moveDown(0.2);
  doc.fontSize(11).text(subHeaderText, {
    align: "center",
  });
  doc.moveDown();
};

const generateReportFooter = (
  doc: InstanceType<typeof PDFDocument>,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  kiri: { text: string; nama: string; NIP: string },
  kanan: { text: string; nama: string; NIP: string }
) => {
  drawCell(doc, kiri.text, x1, y1, 250, "center", 11, 0, 0);

  drawCell(doc, `${kiri.nama}`, x1, y2, 250, "center", 11, 0, 0, true);
  drawCell(doc, `${kiri.NIP}`, x1, y2 + 12, 250, "center", 11, 0, 0, false);

  drawCell(doc, kanan.text, x2, y1, 250, "center", 11, 0, 0);
  drawCell(doc, `${kanan.nama}`, x2, y2, 250, "center", 11, 0, 0, true);

  drawCell(doc, `${kanan.NIP}`, x2, y2 + 12, 250, "center", 11, 0, 0, false);
};

export interface TableOptions {
  startX: number; // x-coordinate for the start of the table
  startY: number; // y-coordinate for the start of the table
  startYonFirstPage: number; // y-coordinate for the start of the table on the first page
  headerRowHeight: number; // tinggi untuk masing-masing baris header
  headerNumberingRowHeight: number; // tinggi untuk baris header nomor dibawah header
  dataRowHeight: number; // tinggi untuk masing-masing row data
}
export interface TableFooterOptions {
  kiri: { text: string; nama: string; NIP: string };
  kanan: { text: string; nama: string; NIP: string };
}

export interface ReportHeaderOptions<T> {
  data: T;
}

// Define a type for the reportHeader function
export interface ReportHeader<T = any> {
  // Default to any to avoid making it generic
  fn: (
    doc: InstanceType<typeof PDFDocument>,
    options: ReportHeaderOptions<T>
  ) => void;
  options: ReportHeaderOptions<T>;
  pageNote?: string;
}

export interface TableDinamisOptions {
  satker?: string;
  tableTitle?: string;
  tableSubtitle?: string;
  tableData: DataGroup[];
  tableColumnHeaders: TableColumnHeader[];
  tableOptions: TableOptions;
  tableFooterOptions: TableFooterOptions;
  layout?: "landscape" | "portrait";
  reportHeader?: ReportHeader;
}

export async function generateTabelDinamis(options: TableDinamisOptions) {
  //desctucturing options
  const {
    satker,
    tableTitle,
    tableSubtitle,
    tableData,
    tableColumnHeaders,
    tableOptions,
    tableFooterOptions,
    layout,
    reportHeader,
  } = options;

  const {
    startX,
    startY,
    headerRowHeight,
    headerNumberingRowHeight,
    dataRowHeight,
    startYonFirstPage,
  } = tableOptions;

  const customFontPath = path.resolve(
    process.cwd(),
    "fonts/helvetica/Helvetica.ttf"
  );

  const doc = new PDFDocument({
    font: customFontPath,
    size: "A4",
    margins: { top: 15, bottom: 15, left: 10, right: 15 },
    layout: layout,
  });

  // Buffers to hold PDF data
  const buffers: Buffer[] = [];

  // Listen for data and end events
  doc.on("data", buffers.push.bind(buffers));

  // Generate PDF content

  try {
    // Generate report header
    // if (reportHeader) is supplied in options then use that function
    // else use default report header
    if (reportHeader) {
      reportHeader.fn(doc, reportHeader.options);
    } else {
      generateReportHeader(doc, satker, tableTitle, tableSubtitle);
    }

    generateTable(
      doc,
      tableColumnHeaders,
      tableData,
      startX,
      startY,
      startYonFirstPage,
      headerRowHeight,
      dataRowHeight
    );

    // how to detect last start y

    // Detect current x and y coordinates
    let currentX = doc.x;
    let currentY = doc.y;
    console.log(`Current X: ${currentX}, Current Y: ${currentY}`);

    // Generate a line for debugging purposes
    // doc
    //   .moveTo(startX, currentY + dataRowHeight) // Move to the start of the line
    //   .lineTo(currentX + 10, currentY + dataRowHeight) // Draw the line to the end point
    //   .stroke(); // Apply the stroke to draw the line

    // doc
    //   .moveTo(startX, currentY + 80 + dataRowHeight) // Move to the start of the line
    //   .lineTo(currentX + 10, currentY + 80 + dataRowHeight) // Draw the line to the end point
    //   .stroke(); // Apply the stroke to draw the line

    // mulai dari sini generate footer
    const { kiri, kanan } = tableFooterOptions;

    const doctWidth = doc.page.width;
    console.log("doc.page.width", doctWidth);

    //calculate how many lines needed for footer by counting \n in text
    let footerLines = 0;
    if (kiri.text) {
      footerLines = kiri.text.split("\n").length;
    }
    if (kanan.text) {
      const lines = kanan.text.split("\n").length;
      if (lines > footerLines) {
        footerLines = lines;
      }
    }

    // tambahkan y1 dengan tinggi footer line
    const defaultRangeY1Y2 = 50;
    const additionalHeight = defaultRangeY1Y2 + footerLines * 10;

    let y1 = currentY + dataRowHeight;
    let y2 = y1 + additionalHeight;
    let x1 = startX;
    let x2 = doctWidth - 300;

    // check if need to add page if the last row is near the end of the page
    const availableHeight = doc.page.height; // 60 is margin
    const isPageNeeded = y2 > availableHeight;
    logger.debug("isPageNeeded", isPageNeeded, y1 + startY, availableHeight);
    if (isPageNeeded) {
      doc.addPage();
      // tambahkan total lagi disini ?
      x1 = startX;
      x2 = doctWidth - 300;
      y1 = startY;
      y2 = y1 + additionalHeight;
    }

    // add page note if any
    if (reportHeader && reportHeader.pageNote) {
      drawCell(doc, reportHeader.pageNote, 600, 25, 200, "center", 6, 0, 0);
    }
    generateReportFooter(doc, x1, x2, y1, y2, kiri, kanan);

    doc.end();
    // Wait for 'end' event to ensure the document generation is complete
    await once(doc, "end");
    // Concatenate the buffers once the PDF generation is complete
    const pdfBuffer = Buffer.concat(buffers);
    return pdfBuffer;
    // Return a NextResponse with the PDF content
    // return new NextResponse(pdfBuffer, {
    //   status: 200,
    //   headers: {
    //     "Content-Type": "application/pdf",
    //     // "Content-Disposition": 'attachment; filename="payroll.pdf"',
    //   },
    // });
  } catch (error) {
    throw new Error("Failed to generate PDF");
  }
}

export default generateTabelDinamis;
