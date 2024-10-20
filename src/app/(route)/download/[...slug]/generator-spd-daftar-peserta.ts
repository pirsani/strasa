import { getKegiatanIncludeSpd, KegiatanIncludeSpd } from "@/data/kegiatan";
import generateTabelDinamis, {
  DataGroup,
  drawCell,
  ReportHeaderOptions,
  TableColumnHeader,
  TableDinamisOptions,
  TableFooterOptions,
  TableOptions,
} from "@/lib/pdf/tabel-dinamis";
import { formatTanggal } from "@/utils/date-format";
import { PesertaKegiatan } from "@prisma-honorarium/client";
import { differenceInDays } from "date-fns";
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit"; // Importing PDFDocument as a value
import { Logger } from "tslog";

const logger = new Logger({
  //hideLogPositionForProduction: true,
});

// ReportHeaderOptions must conform to ReportHeaderOptions
const generateReportHeader = (
  doc: InstanceType<typeof PDFDocument>,
  options: ReportHeaderOptions<KegiatanIncludeSpd>
) => {
  const kegiatan = options.data;
  const nomor = kegiatan.spd?.nomorSPD || "-";
  const tanggal = formatTanggal(kegiatan.spd?.tanggalSPD) || "-";
  const namaKegiatan = kegiatan.nama;
  const tanggalPenyelenggaraan = `${formatTanggal(
    kegiatan.tanggalMulai
  )} - ${formatTanggal(kegiatan.tanggalSelesai)}`;
  const kota = kegiatan.kota?.split(";")[1] || "-"; // di database kota disimpan dengan format idkota;namakota
  const satker = kegiatan.satker.nama;
  const kl = "Kementerian Luar Negeri";

  const textLampiranIV = `
  LAMPIRAN IV 
  PERATURAN DIRJEN PERBENDAHARAAN NOMOR PER-22/PB/2013 TENTANG KETENTUAN 
  LEBIH LANJUT PELAKSANAAN PERJALANAN DINAS DALAM NEGERI BAGI PEJABAT NEGARA, 
  PEGAWAI NEGERI DAN PEGAWAI TIDAK TETAP`;

  drawCell(doc, `${textLampiranIV}`, 550, 5, 400, "left", 6, 0, 1.1);

  const x1 = 45;
  const x2 = 250;
  const wx1 = 200;
  drawCell(doc, `Lampiran SPD`, x1, 30, wx1, "left", 11, 0, 0);

  drawCell(doc, `Nomor`, x1, 42, wx1, "left", 11, 0, 0);
  drawCell(doc, `:`, x2, 42, 10, "left", 11, 0, 0);
  drawCell(doc, `${nomor}`, x2 + 10, 42, 200, "left", 11, 0, 0);

  drawCell(doc, `Tanggal`, x1, 54, wx1, "left", 11, 0, 0);
  drawCell(doc, `:`, x2, 54, 10, "left", 11, 0, 0);
  drawCell(doc, `${tanggal}`, x2 + 10, 54, 200, "left", 11, 0, 0);

  drawCell(doc, `DAFTAR PESERTA KEGIATAN`, x1, 66, wx1, "left", 11, 0, 0);
  drawCell(doc, `:`, x2, 66, 10, "left", 11, 0, 0);
  drawCell(doc, `${namaKegiatan}`, x2 + 10, 66, 500, "left", 11, 0, 0);

  drawCell(doc, `TANGGAL PENYELENGGARAAN`, x1, 102, wx1, "left", 11, 0, 0);
  drawCell(doc, `:`, x2, 102, 10, "left", 11, 0, 0);
  drawCell(
    doc,
    `${tanggalPenyelenggaraan}`,
    x2 + 10,
    102,
    200,
    "left",
    11,
    0,
    0
  );

  drawCell(doc, `KOTA TEMPAT PENYELENGGARAAN`, x1, 114, wx1, "left", 11, 0, 0);
  drawCell(doc, `:`, x2, 114, 200, "left", 11, 0, 0);
  drawCell(doc, `${kota}`, x2 + 10, 114, 200, "left", 11, 0, 0);

  drawCell(doc, `SATUAN KERJA`, x1, 126, wx1, "left", 11, 0, 0);
  drawCell(doc, `:`, x2, 126, 10, "left", 11, 0, 0);
  drawCell(doc, `${satker}`, x2 + 10, 126, 200, "left", 11, 0, 0);

  drawCell(doc, `KEMENTERIAN NEGARA/LEMBAGA`, x1, 138, wx1, "left", 11, 0, 0);
  drawCell(doc, `:`, x2, 138, 10, "left", 11, 0, 0);
  drawCell(doc, `${kl}`, x2 + 10, 138, 200, "left", 11, 0, 0);

  // doc.fontSize(11).text(namaKegiatan, { align: "center" });
  // doc.moveDown(0.2);
  // doc.fontSize(11).text(kota, {
  //   align: "center",
  // });
  // doc.moveDown();
};

const columns: TableColumnHeader[] = [
  {
    level: 1,
    header: "No.",
    headerNumberingString: "1",
    field: "no",
    width: 30,
    align: "center",
  },
  {
    level: 1,
    header: "Nama Pelaksana SPD/NIP/Jabatan/Pangkat Golongan",
    headerNumberingString: "2",
    field: "peserta",
    width: 120,
    align: "left",
  },
  {
    level: 1,
    header: "Tempat Kedudukan Asal",
    headerNumberingString: "3",
    field: "kedudukanAsal",
    width: 60,
    align: "left",
  },
  {
    level: 1,
    header: "Tingkat Biaya Perjalanan Dinas ",
    headerNumberingString: "4",
    field: "tingkat",
    width: 50,
    align: "left",
  },
  {
    level: 1,
    header: "Alat Angkutan yang digunakan",
    headerNumberingString: "5",
    field: "alatAngkutan",
    width: 60,
    align: "left",
  },
  {
    level: 1,
    header: "Surat Tugas",
    width: 140,
    align: "center",
    subHeader: [
      {
        level: 2,
        header: "Nomor",
        headerNumberingString: "6",
        field: "suratTugasNomor",
        // isSummable: true,
        // format: "currency",
        // currency: "USD",
        width: 85,
        align: "right",
      },
      {
        level: 2,
        header: "Tanggal",
        headerNumberingString: "7",
        field: "suratTugasTanggal",
        // format: "currency",
        // currency: "IDR",
        //isSummable: true,
        width: 55,
        align: "right",
      },
    ],
  },
  {
    level: 1,
    header: "Tanggal",
    width: 120,
    align: "center",
    subHeader: [
      {
        level: 2,
        header: "Berangkat",
        headerNumberingString: "8",
        field: "tanggalBerangkat",
        //isSummable: true,
        width: 60,
        align: "right",
      },
      {
        level: 2,
        header: "Kembali",
        headerNumberingString: "9",
        field: "tanggalKembali",
        width: 60,
        align: "right",
      },
    ],
  },
  {
    level: 1,
    header: "Lama Dinas (hari)",
    headerNumberingString: "10",
    field: "jumlahHariDinas",
    //isSummable: true,
    width: 50,
    align: "center",
  },
  {
    level: 1,
    header: "Keterangan",
    headerNumberingString: "11",
    field: "keterangan",
    width: 90,
    align: "center",
  },
];

export async function generateSpdDaftarPeserta(req: Request, slug: string[]) {
  // Example table columns with nested subheaders

  const kegiatan = await getKegiatanIncludeSpd("uqpugvsxn0vkr0zxo3mvywpe");
  if (!kegiatan) {
    throw new Error("kegiatan not found");
  }

  const rows: TableRow[] = mapPesertaToTableRow(kegiatan.pesertaKegiatan);

  const peserta: DataGroup = {
    nama: "Peserta",
    groupMembers: rows as any[],
  };

  const jadwals = [peserta];

  try {
    const tableOptions: TableOptions = {
      startX: 45,
      startY: 75,
      startYonFirstPage: 130,
      headerRowHeight: 25,
      headerNumberingRowHeight: 15,
      dataRowHeight: 60,
    };

    const footerOptions: TableFooterOptions = {
      // kiri: { text: "test", nama: "fulan", NIP: "6537327432" },
      kiri: { text: "", nama: "", NIP: "" },
      kanan: { text: "test", nama: "fulan", NIP: "NIP. 6537327432" },
    };

    const reportHeaderOptions: ReportHeaderOptions<KegiatanIncludeSpd> = {
      data: kegiatan,
    };
    const tabelDinamisOptions: TableDinamisOptions = {
      //satker,
      //tableTitle: titleText,
      //tableSubtitle: subtitleText,
      tableData: jadwals,
      tableColumnHeaders: columns,
      tableOptions: tableOptions,
      tableFooterOptions: footerOptions,
      layout: "landscape",
      reportHeader: {
        fn: generateReportHeader,
        options: reportHeaderOptions,
      }, // custom header function
    };
    const pdfBuffer = await generateTabelDinamis(tabelDinamisOptions);
    return pdfBuffer;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate PDF");
  }
}
interface TableRow {
  no: number;
  peserta: string;
  kedudukanAsal: string;
  tingkat: string;
  alatAngkutan: string;
  suratTugasNomor: string;
  suratTugasTanggal: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
  jumlahHariDinas: number;
  keterangan: string;
}
const mapPesertaToTableRow = (
  peserta?: PesertaKegiatan[] | null
): TableRow[] => {
  if (!peserta) {
    return [];
  }
  let n = 0;
  const rows: TableRow[] = peserta.map((p) => {
    n++;
    const jumlahHariDinas =
      p.tanggalBerangkat &&
      p.tanggalKembali &&
      differenceInDays(p.tanggalBerangkat, p.tanggalKembali) + 1;
    return {
      no: n,
      peserta: `${p.nama} \n ${p.NIP} \n ${p.jabatan} \n ${p.pangkatGolonganId}`,
      kedudukanAsal: "Jakarta",
      tingkat: "",
      alatAngkutan: "Kendaraan Darat / Udara",
      suratTugasNomor: `nomor:`,
      suratTugasTanggal: `tanggal:`,
      tanggalBerangkat: formatTanggal(p.tanggalBerangkat),
      tanggalKembali: formatTanggal(p.tanggalKembali),
      jumlahHariDinas: jumlahHariDinas || 0,
      keterangan: "",
    };
  });

  return rows;
};

export async function downloadSpdDaftarPeserta(req: Request, slug: string[]) {
  const pdfBuffer = await generateSpdDaftarPeserta(req, slug);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      // "Content-Disposition": 'attachment; filename="payroll.pdf"',
    },
  });
}

export default downloadSpdDaftarPeserta;
