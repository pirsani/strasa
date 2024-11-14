import Decimal from "decimal.js";
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
  field?: string;
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
    //logger.debug("fullValue", fullValue);
    // Set the font size before measuring the width of the space character
    doc.fontSize(fontSize);

    // Use a regular expression to split the currency symbol from the value
    //const match = fullValue.match(/^([^\d\s]+)\s*(\d.+)$/);
    const match = fullValue.match(/^([^\d\s]+)\s*([\d,.]+)$/);

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

export const getDeepestColumns = (
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
const drawCell = (
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

const generateNumberingHeader = (
  doc: InstanceType<typeof PDFDocument>,
  flatColumns: TableColumnHeader[],
  startX: number,
  startY: number,
  rowHeight: number = 20
) => {
  // logger.info("[generateNumberingHeader START]");

  flatColumns.forEach((column, index) => {
    const columnXOffset = getColumnXOffset(flatColumns, index);
    const columnStartX = startX + columnXOffset;
    const columnStartY = startY + rowHeight;

    // Draw the header text
    drawCell(
      doc,
      column.headerNumberingString || String(index + 1),
      columnStartX,
      columnStartY,
      column.width,
      "center"
    );

    doc.rect(columnStartX, columnStartY, column.width, rowHeight).stroke();
  });

  //logger.info("[generateNumberingHeader END]");
};

const generateTableHeader = (
  doc: InstanceType<typeof PDFDocument>,
  tableColumnHeaders: TableColumnHeader[],
  startX: number,
  startY: number,
  rowHeight: number = 20
) => {
  //logger.info("[generateTableHeader START]");

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
  //logger.info("[generateTableHeader END]");
};

const generateTableRow = (
  doc: InstanceType<typeof PDFDocument>,
  row: TableRow,
  tableColumnHeaders: TableColumnHeader[],
  startX: number,
  y: number,
  rowHeight: number = 20
) => {
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

const sumData = (data: Decimal[][]): Decimal[] => {
  return data.reduce(
    (acc, row) => {
      return acc.map((value, index) => value.plus(row[index]));
    },
    data[0].map(() => new Decimal(0))
  );
};

const generateSumRow = (
  textNarasiJumlah: string,
  doc: InstanceType<typeof PDFDocument>,
  data: Decimal[][],
  deepestColumns: TableColumnHeader[],
  startX: number,
  lastY: number,
  sumRowHeight: number = 25,
  width: number = 200
) => {
  // add summary before new page
  const currentY = doc.y;
  console.log("[currentY before new page]", currentY);
  doc.rect(startX, lastY, width, sumRowHeight).stroke();

  const accumulatedSum = sumData(data);

  let i = 0;
  deepestColumns.forEach((column, index) => {
    const columnXOffset = getColumnXOffset(deepestColumns, index);
    const columnStartX = startX + columnXOffset;
    const columnStartY = lastY;

    // Draw the header text
    //drawCell(doc, "nilai", columnStartX, columnStartY, column.width, "center");
    if (column.isSummable) {
      let val = String(accumulatedSum[i]);
      if (column.format === "currency") {
        const currValue = formatCurrency(
          accumulatedSum[i],
          "id-ID",
          column.currency
        );
        // Spread value across column width if needed to fit the text Rp 1.000.000,00 -> Rp   1.000.000,00
        val = justifyBetween(String(currValue), column.width, 8, doc);
      }

      doc.rect(columnStartX, columnStartY, column.width, sumRowHeight).stroke();
      drawCell(
        doc,
        val,
        columnStartX,
        columnStartY,
        column.width,
        column.align
      );
      i++;
    }
  });

  drawCell(doc, textNarasiJumlah, startX, lastY, width, "left", 10, 5, 0);
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
  headerNumberingRowHeight: number = 20,
  dataRowHeight: number = 25
) => {
  logger.info("===generateTable===");
  const deepestColumns = getDeepestColumns(tableColumnHeaders);
  const maxLevel = findMaxLevel(tableColumnHeaders);
  const totalHeightHeader = maxLevel * headerRowHeight;
  const availableHeight = doc.page.height - 60;

  // count total width
  const totalWidth = getTotalTableWidth(deepestColumns);

  // filter deepest column that isSummable === true
  const summableColumns = deepestColumns.filter((column) => column.isSummable);
  let pageSums = summableColumns.map(() => new Decimal(0));
  const pageSumsArray: Decimal[][] = []; // Explicitly define the type
  const resetSums = () => {
    pageSumsArray.push([...pageSums]);
    pageSums = summableColumns.map(() => new Decimal(0));
  };

  logger.info("[PREPARATION DONE]");

  generateTableHeader(doc, tableColumnHeaders, startX, startY, headerRowHeight);
  generateNumberingHeader(
    doc,
    deepestColumns,
    startX,
    startY + totalHeightHeader + headerRowHeight - headerNumberingRowHeight,
    headerNumberingRowHeight
  );

  let sumRowHeight = 20;
  const heightDivider = 15;
  // generate table row
  // untuk halaman 2 dan selanjutnya
  let controlBaseStartY =
    startY +
    totalHeightHeader +
    headerRowHeight +
    headerNumberingRowHeight +
    sumRowHeight; // 20 is sumRowHeight
  let controlStartYRowgroupMembers = controlBaseStartY + heightDivider;
  let dataGroupIterator = 0;
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

    // hanya tambahkan sumRowHeight jika page > 1 karena di page 1 tidak ada pindahan jumlah
    // tambahkan headerNumberingRowHeight di halaman 1
    const addedSumRowHeight =
      page == 1 ? headerNumberingRowHeight : sumRowHeight;
    let baseStartY =
      startY +
      totalHeightHeader +
      headerRowHeight +
      totalHeightRow +
      addedSumRowHeight;

    // divider row dengan nama kelas
    let dividerStartY = baseStartY + 3 + dataGroupIterator * heightDivider;

    const isNewPageNeeded =
      dividerStartY + heightDivider + dataRowHeight > availableHeight;

    if (isNewPageNeeded) {
      logger.info("[isNewPageNeeded-1-yes]", isNewPageNeeded);

      // reset startY
      rowCounterOnPage = 0;
      dataGroupIterator = 0;

      // generate sum row before new page
      resetSums();
      const lastY = dividerStartY - 3; // plus 3 agar tulisan tidak berada tepat di garis
      generateSumRow(
        "Jumlah yang dipindahkan",
        doc,
        pageSumsArray,
        deepestColumns,
        startX,
        lastY,
        20,
        totalWidth
      );

      doc.addPage(); // new page
      page++;
      console.log("[NEW PAGE] on new divider", page);
      baseStartY = controlBaseStartY;
      dividerStartY = baseStartY + 3;
      generateTableHeader(
        doc,
        tableColumnHeaders,
        startX,
        startY,
        headerRowHeight
      );
      generateNumberingHeader(
        doc,
        deepestColumns,
        startX,
        startY + totalHeightHeader + headerRowHeight - headerNumberingRowHeight,
        headerNumberingRowHeight
      );
      generateSumRow(
        "Jumlah Pindahan",
        doc,
        pageSumsArray,
        deepestColumns,
        startX,
        startY + totalHeightHeader + headerRowHeight + headerNumberingRowHeight,
        sumRowHeight,
        totalWidth
      );
    } else {
      //console.log("[CONTINUE]", dataGroupIndex);
      logger.info("[isNewPageNeeded-1-no]", isNewPageNeeded);
    }

    // Set the fill color for the rectangle
    //console.log("Draw divider", dividerStartY, "\n");
    // Draw the rectangle for dataGroup.name
    logger.info("[dividerStartY] dataGroup.name", dividerStartY);
    doc
      .fillColor("#e9ecef") // Set the desired background color
      .rect(
        startX,
        baseStartY + dataGroupIterator * heightDivider,
        //dividerStartY,
        totalWidth,
        heightDivider
      )
      .fillAndStroke(); // Fill the rectangle with the background color and draw the border
    // Reset the fill color to default (black) or transparent
    doc.fillColor("black");

    drawCell(
      doc,
      //`halaman ${page} ${dataGroup.nama} dataGroupIterator ${dataGroupIterator} dataGroupIndex ${dataGroupIndex}`,
      `${dataGroup.nama}`,
      startX,
      dividerStartY,
      totalWidth,
      "center",
      10,
      0,
      0
    );

    let startYRowgroupMembers =
      baseStartY + (dataGroupIterator + 1) * heightDivider;
    if (isNewPageNeeded) {
      startYRowgroupMembers = controlStartYRowgroupMembers;
    }

    let rowReset = false;

    /*
    contoh jika data dalam 1 group ada 15 data 
    kemudian jika setiap halaman hanya bisa menampung 5 data 
    maka pada row ke 6 akan pindah ke halaman baru
    pada row ke 7, akan menerima sinyal reset = true; // pada saat ini index(6) dan rowCounterOnPage(1) ini yg memulai reset untu rowCounterOnPage
    sehingga untu row ke 8, akan dicek jika index(7) tidak sama dengan rowCounterOnPage(2) 
    index disini adalah anggota group,
    jika masih satu group maka posisi startYDynamic = startYDynamic - 15 ( karena tidak ada header grup baru)

    //ENHANCEMENT : sebenernya akan lebih mudah jika semua halaman juga mempunyai header grup
    */
    // Iterate and generate row for each groupMembers
    // calculate subSumRow
    dataGroup.groupMembers.forEach((groupMembers, rowIndex) => {
      //logger.info("[rowCounterOnPage]", rowIndex, rowCounterOnPage);

      let startYDynamic =
        startYRowgroupMembers + dataRowHeight * rowCounterOnPage;

      if (rowReset) {
        startYDynamic = controlStartYRowgroupMembers + dataRowHeight - 15;
        logger.debug(
          "[startYDynamic] isReset=y ",
          rowIndex,
          rowCounterOnPage,
          startYDynamic
        );
      } else {
        // rowCounterOnPage != rowIndex berarti masih satu grup
        if (rowCounterOnPage != rowIndex) {
          startYDynamic = startYDynamic - 15;
        }
      }
      logger.debug(
        "[startYDynamic]",
        rowIndex,
        rowCounterOnPage,
        startYDynamic
      );

      const isNewPageNeeded = startYDynamic + dataRowHeight > availableHeight;
      if (isNewPageNeeded) {
        logger.info("[isNewPageNeeded-2-yes]", rowIndex, rowCounterOnPage);

        rowCounterOnPage = 0;
        dataGroupIterator = 0;
        rowReset = true;

        // generate sum row before new page
        resetSums();
        console.log("Page Sums:", pageSumsArray);
        console.log(pageSumsArray[page - 1]); // array is zero based
        const dataSum = pageSumsArray[page - 1];
        generateSumRow(
          "Jumlah yang dipindahkan",
          doc,
          pageSumsArray,
          deepestColumns,
          startX,
          startYDynamic,
          20,
          totalWidth
        );

        doc.addPage(); // new page
        page++;
        //console.log("[NEW PAGE] on new row", page);

        // reset startY
        startYDynamic = controlBaseStartY;
        baseStartY = controlBaseStartY;
        startYRowgroupMembers = controlStartYRowgroupMembers;
        generateTableHeader(
          doc,
          tableColumnHeaders,
          startX,
          startY,
          headerRowHeight
        );
        generateNumberingHeader(
          doc,
          deepestColumns,
          startX,
          startY +
            totalHeightHeader +
            headerRowHeight -
            headerNumberingRowHeight,
          headerNumberingRowHeight
        );
        // add sum row jumlah pindahan
        generateSumRow(
          "Jumlah Pindahan",
          doc,
          pageSumsArray,
          deepestColumns,
          startX,
          startYDynamic - sumRowHeight,
          sumRowHeight,
          totalWidth
        );
        summableColumns.forEach((column, columnIndex) => {
          const columnValue = groupMembers[column.field as string];
          pageSums[columnIndex] = pageSums[columnIndex].plus(
            new Decimal(columnValue)
          );
        });
      } else {
        //logger.info("[isNewPageNeeded-2-no]", rowCounterOnPage);
        //logger.info("[summableColumns]", summableColumns);

        rowReset = false;

        // sum row
        summableColumns.forEach((column, columnIndex) => {
          const columnValue = groupMembers[column.field as string];
          // check if columns is number

          // Check if columnValue is a number
          if (typeof columnValue === "number" || !isNaN(Number(columnValue))) {
            pageSums[columnIndex] = pageSums[columnIndex].plus(
              new Decimal(columnValue)
            );
          } else {
            logger.warn(
              `Skipping non-numeric value in column ${column.field}: ${columnValue}`
            );
          }
        });
      }

      logger.info("[BEFORE generateTableRow]", rowCounterOnPage);

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
        resetSums();
        const lastY = startYDynamic + dataRowHeight;
        // setelah row terakhir perlu footer yang berisi tanggal dan ttd
        // maka jika tidak cukup tinggi, maka perlu new page
        const isNewPageNeeded = lastY + 100 > availableHeight;

        console.log("Last Page Sums:", pageSumsArray);
        generateSumRow(
          isNewPageNeeded ? "Jumlah yang dipindahkan" : "Jumlah Total",
          doc,
          pageSumsArray,
          deepestColumns,
          startX,
          lastY,
          20,
          totalWidth
        );

        console.log("isNewPageNeeded", isNewPageNeeded);
        if (isNewPageNeeded) {
          doc.addPage(); // new page
          page++;
          console.log("[NEW PAGE] on last row", page);
          // reset startY
          startYDynamic = controlBaseStartY;
          baseStartY = controlBaseStartY;
          startYRowgroupMembers = controlStartYRowgroupMembers;
          generateTableHeader(
            doc,
            tableColumnHeaders,
            startX,
            startY,
            headerRowHeight
          );
          generateNumberingHeader(
            doc,
            deepestColumns,
            startX,
            startY +
              totalHeightHeader +
              headerRowHeight -
              headerNumberingRowHeight,
            headerNumberingRowHeight
          );
          // add sum row jumlah pindahan
          generateSumRow(
            "Jumlah Pindahan",
            doc,
            pageSumsArray,
            deepestColumns,
            startX,
            startYDynamic - sumRowHeight,
            sumRowHeight,
            totalWidth
          );
          generateSumRow(
            "Jumlah Total",
            doc,
            pageSumsArray,
            deepestColumns,
            startX,
            startYDynamic,
            sumRowHeight,
            totalWidth
          );
        }
      }
      rowCounterOnPage++;
    });

    dataGroupIterator++;
  });

  return { summableColumns, pageSumsArray };
};

export const generateReportHeader = (
  doc: InstanceType<typeof PDFDocument>,
  satker: string,
  headerText: string,
  subHeaderText: string
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
  drawCell(
    doc,
    `NIP. ${kiri.NIP}`,
    x1,
    y2 + 12,
    250,
    "center",
    11,
    0,
    0,
    false
  );

  drawCell(doc, kanan.text, x2, y1, 250, "center", 11, 0, 0);
  drawCell(doc, `${kanan.nama}`, x2, y2, 250, "center", 11, 0, 0, true);

  drawCell(
    doc,
    `NIP. ${kanan.NIP}`,
    x2,
    y2 + 12,
    250,
    "center",
    11,
    0,
    0,
    false
  );
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

export interface TableDinamisOptions {
  layout?: "landscape" | "portrait";
  satker: string;
  tableTitle: string;
  tableSubtitle: string;
  tableData: DataGroup[];
  tableColumnHeaders: TableColumnHeader[];
  tableOptions: TableOptions;
  tableFooterOptions: TableFooterOptions;
}

export async function generateTabelDinamis(
  options: TableDinamisOptions
  // satker: string,
  // tableTitle: string,
  // tableSubtitle: string,
  // tableData: DataGroup[],
  // tableColumnHeaders: TableColumnHeader[],
  // tableOptions: TableOptions,
  // tableFooterOptions: TableFooterOptions
) {
  //desctucturing

  const {
    layout = "landscape",
    satker,
    tableTitle,
    tableSubtitle,
    tableData,
    tableColumnHeaders,
    tableOptions,
    tableFooterOptions,
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
    //doc.rect(10, 10, 820, 560).stroke(); // reference
    // const lineStartX = 10; // x-coordinate for the start of the line
    // const lineEndX = 820; // x-coordinate for the end of the line
    // const lineY = 560; // y-coordinate for the line

    // doc
    //   .moveTo(lineStartX, lineY) // Move to the start of the line
    //   .lineTo(lineEndX, lineY) // Draw the line to the end point
    //   .stroke(); // Apply the stroke to draw the line

    generateReportHeader(doc, satker, tableTitle, tableSubtitle);

    const { pageSumsArray, summableColumns } = generateTable(
      doc,
      tableColumnHeaders,
      tableData,
      startX,
      startY,
      startYonFirstPage,
      headerRowHeight,
      headerNumberingRowHeight,
      dataRowHeight
    );

    // how to detect last start y

    // Detect current x and y coordinates
    let currentX = doc.x;
    let currentY = doc.y;
    console.log(`Current X: ${currentX}, Current Y: ${currentY}`);

    // doc
    //   .moveTo(startX, currentY + dataRowHeight) // Move to the start of the line
    //   .lineTo(currentX + 10, currentY + dataRowHeight) // Draw the line to the end point
    //   .stroke(); // Apply the stroke to draw the line

    // mulai dari sini generate footer
    const { kiri, kanan } = tableFooterOptions;
    // const ppk = {
    //   text: "Mengetahui,\nPejabat Pembuat Komitmen",
    //   nama: "Fulan bin Fulan",
    //   NIP: "1234567890",
    // };
    // const bendahara = {
    //   text: "Bendahara",
    //   nama: "Fulan bin Fulan",
    //   NIP: "1234567890",
    // };
    const doctWidth = doc.page.width;
    console.log("doc.page.width", doctWidth);

    let y1 = currentY + 20;
    let y2 = y1 + 50;
    let x1 = startX;
    let x2 = doctWidth - 300;

    // check if need to add page if the last row is near the end of the page
    const availableHeight = doc.page.height - 60;
    const isPageNeeded = y1 + 75 > availableHeight;
    if (isPageNeeded) {
      doc.addPage();
      // tambahkan total lagi disini ?
      x1 = startX;
      x2 = doctWidth - 300;
      y1 = startY;
      y2 = y1 + 50;
    }

    generateReportFooter(doc, x1, x2, y1, y2, kiri, kanan);

    doc.end();
    // Wait for 'end' event to ensure the document generation is complete
    await once(doc, "end");
    // Concatenate the buffers once the PDF generation is complete
    const pdfBuffer = Buffer.concat(buffers);
    return { pdfBuffer, pageSumsArray, summableColumns };
    //return pdfBuffer;
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
