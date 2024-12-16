import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Utility function to generate an Excel file buffer
function exportToExcel(data: Record<string, any>[], sheetName: string): Buffer {
  // Step 1: Convert data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Step 2: Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Step 3: Write workbook to buffer
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}

// API route to handle Excel file generation
export async function downloadExcelPembayaran(req: Request, slug: string[]) {
  try {
    // Example data, can be fetched dynamically based on `slug`
    const data = [
      { Name: "Alice", Age: 25, Location: "New York" },
      { Name: "Bob", Age: 30, Location: "San Francisco" },
      { Name: "Charlie", Age: 35, Location: "Los Angeles" },
    ];

    // validate slug, must have at least 2 item
    if (slug.length < 2) {
      return NextResponse.json(
        { error: "Invalid request, missing required parameters" },
        { status: 400 }
      );
    }

    // Generate Excel buffer
    const excelBuffer = exportToExcel(data, "Pembayaran");

    // Return the Excel file as a response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="pembayaran.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}
