import {
  getRiwayatPengajuanPaymentStatus,
  RiwayatPengajuanPaymentStatus,
} from "@/data/pembayaran/extra-info-riwayat-pengajuan";
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

const generateExcel = (data: RiwayatPengajuanPaymentStatus[]) => {
  // Define the columns for the Excel file
  const columns = [
    "REFERENSI",
    "STATUS PENGAJUAN",
    "TANGGAL INPUT",
    "TANGGAL VERIFIKASI",
    "TANGGAL BAYAR",
    "MAK",
    "KRO",
    "UPT/BIDANG/BAGIAN",
    "URAIAN",
    "PPK",
    "NILAI",
    "PPN",
    "PPh",
    "NETTO",
  ];

  // Map the data to the columns
  const rows = data.map((item) => {
    const total = Number(item.total ?? 0); // Explicitly ensure it's a number
    const ppn = Number(item.ppn ?? 0);
    const pph = Number(item.pph ?? 0);
    const netto = total - ppn - pph;

    // Log the values for debugging
    console.log(
      `ID: ${item.id}, Total: ${total}, PPN: ${ppn}, PPh: ${pph}, Netto: ${netto}`
    );

    // Map each item to a row matching the column order
    return [
      item.id,
      item.status_pembayaran,
      item.diajukan_tanggal,
      item.diverifikasi_tanggal,
      item.dibayar_tanggal,
      item.mak,
      item.kro,
      item.unit_kerja_nama,
      item.uraian,
      item.ppk_nama,
      total, // NILAI
      ppn,
      pph,
      netto, // NETTO
    ];
  });

  // Create a new workbook and worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Pengajuan");

  // Define the number format for the relevant columns
  const numberFormat = "#,##0";

  // Apply the number format to the relevant cells
  const range = XLSX.utils.decode_range(worksheet["!ref"]!);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = 10; C <= 13; ++C) {
      // Columns for NILAI, PPN, PPh, NETTO
      const cell_address = { c: C, r: R };
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      if (!worksheet[cell_ref]) continue;
      worksheet[cell_ref].z = numberFormat;
    }
  }

  // Step 3: Write workbook to buffer
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
};

// API route to handle Excel file generation
export async function downloadExcelPembayaran(req: Request, slug: string[]) {
  try {
    // Example data, can be fetched dynamically based on `slug`

    // validate slug, must have at least 2 item
    if (slug.length < 2) {
      return NextResponse.json(
        { error: "Invalid request, missing required parameters" },
        { status: 400 }
      );
    }

    const data = await getRiwayatPengajuanPaymentStatus(
      2024,
      "cm4ea2pwc0067w5l7ujlxjwel"
    );

    // Generate Excel buffer
    const excelBuffer = generateExcel(data);

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
