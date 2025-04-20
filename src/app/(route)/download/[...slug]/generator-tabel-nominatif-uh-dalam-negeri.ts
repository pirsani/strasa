import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import generateTabelDinamis, {
  DataGroup,
  TableColumnHeader,
  TableDinamisOptions,
  TableFooterOptions,
  TableOptions,
  TableRow,
} from "@/lib/pdf/tabel-nominatif-dinamis-uh";
import { formatTanggal } from "@/utils/date-format";
import formatCurrency from "@/utils/format-currency";
import {
  Kegiatan,
  RiwayatPengajuan,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { Logger } from "tslog";
import { sumPageSumsArray } from "./utils";

const logger = new Logger({
  hideLogPositionForProduction: true,
});

type InputJsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: InputJsonValue }
  | InputJsonValue[];

// interface Jadwal {
//   nama: string; // nama kelas
//   tanggal: string;
//   jam: string;
//   jadwalNarasumber: TableRow[]; // TableRow[] ini dari JadwalNarasumber
// }

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
    header: "NAMA/NIP/Jabatan/Golongan",
    headerNumberingString: "2",
    field: "namaNipNpwp",
    width: 90,
    align: "left",
  },

  {
    level: 1,
    header: "Penerimaan",
    width: 290,
    align: "center",
    subHeader: [
      {
        level: 2,
        header: "Jenis",
        headerNumberingString: "3",
        field: "jenis",
        width: 35,
        align: "center",
      },
      {
        level: 2,
        header: "hr",
        headerNumberingString: "4",
        field: "hr",
        width: 25,
        align: "center",
      },
      {
        level: 2,
        header: "Besaran",
        headerNumberingString: "6",
        field: "besaran",
        // format: "currency",
        // currency: "IDR",
        width: 65,
        align: "right",
      },
      {
        level: 2,
        header: "Jumlah",
        headerNumberingString: "7",
        field: "jumlah",
        //format: "currency",
        //currency: "IDR",
        //isSummable: true,
        width: 65,
        align: "right",
      },
      {
        level: 2,
        header: "%",
        headerNumberingString: "8",
        field: "persentase",
        width: 35,
        align: "right",
      },
      {
        level: 2,
        header: "Total",
        headerNumberingString: "9",
        field: "total",
        format: "currency",
        currency: "IDR",
        isSummable: true,
        width: 65,
        align: "right",
      },
    ],
  },
  {
    level: 1,
    header: "NAMA DAN NOMOR REKENING",
    headerNumberingString: "11",
    field: "bankConcated",
    width: 90,
    align: "center",
  },
];

export async function generateDaftarNominatif(req: Request, slug: string[]) {
  // Example table columns with nested subheaders

  const kegiatanId = slug[1];

  const kegiatan = await dbHonorarium.kegiatan.findFirst({
    where: {
      id: kegiatanId,
    },
    include: {
      provinsi: true,
      pesertaKegiatan: {
        include: {
          uhDalamNegeri: true,
        },
      },
    },
  });

  if (!kegiatan) {
    throw new Error("Kegiatan not found");
  }

  const lokasi = kegiatan.lokasi;
  const provinsi = kegiatan.provinsiId!;
  // find SBM
  const tahunSbm = kegiatan.tanggalMulai.getFullYear();
  const sbm = await dbHonorarium.sbmUhDalamNegeri.findFirst({
    where: {
      provinsiId: provinsi,
      tahun: tahunSbm,
    },
  });

  if (!sbm) {
    const error = `E-SBMUHDN-01`;
    const message = `SBM Uang Harian ${kegiatan.provinsi?.nama} tahun ${tahunSbm} tidak ditemukan, silakan impor data SBM Uang Harian terlebih dahulu.`;
    logger.error(error, message);
    throw new Error(message);
  }

  const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findFirst({
    where: {
      kegiatanId,
      jenis: "UH_DALAM_NEGERI",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      bendahara: true,
      ppk: true,
    },
  });

  if (!riwayatPengajuan) {
    throw new Error("Riwayat pengajuan not found");
  }

  // check if dokumen is already generated or already exist
  const dokumenNominatif = await getDokumenNominatif(
    kegiatan,
    riwayatPengajuan
  );
  console.log("[dokumenNominatif]", dokumenNominatif);

  if (
    dokumenNominatif.isFileExist &&
    dokumenNominatif.file &&
    dokumenNominatif.isFinal
  ) {
    console.log("[file exist]", dokumenNominatif.filePath);
    return new NextResponse(dokumenNominatif.file, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // "Content-Disposition": 'attachment; filename="payroll.pdf"',
      },
    });
  }
  // it must have file path
  if (!dokumenNominatif.filePath) {
    // it should not happen
    console.error("Dokumen nominatif not found");
    throw new Error("Dokumen nominatif not found");
  }

  // tidak ada dokumen nominatif yang final
  // START GENERATE PDF

  const { bendahara, ppk } = riwayatPengajuan;

  const {
    fullboard: sbmUhFullboard,
    fulldayHalfday: sbmUhFulldayHalfday,
    luarKota: sbmUhLuarKota,
    dalamKota: sbmUhDalamKota,
    diklat: sbmUhDiklat,
  } = sbm;

  const pesertaKegiatan = kegiatan.pesertaKegiatan;

  let n = 0;

  const rows: TableRow[] = pesertaKegiatan.map((peserta) => {
    n += 1;
    const namaNipNpwp =
      peserta.nama +
      "\n" +
      peserta.NIP +
      "\n" +
      peserta.jabatan +
      "\n" +
      peserta.pangkatGolonganId;

    const bank =
      peserta.namaRekening + "\n" + peserta.bank + "\n" + peserta.nomorRekening;

    let jenis = "";
    let besaran = "";
    let jumlah = "";
    const persentase = "100%";
    let total = 0;
    let hr = "";
    if (peserta.uhDalamNegeri) {
      const {
        hDalamKota,
        hLuarKota,
        hFulldayHalfday,
        hFullboard,
        hDiklat,
        hTransport,
        uhDalamKota,
        uhDiklat,
        uhLuarKota,
        uhFullboard,
        uhFulldayHalfday,
        uhTransport,
      } = peserta.uhDalamNegeri;

      if (hDalamKota || hLuarKota) {
        jenis += "UH\n";
        hr += hDalamKota
          ? hDalamKota.toString() + "\n"
          : hLuarKota.toString() + "\n";
        besaran += hDalamKota
          ? formatCurrency(sbmUhDalamKota) + "\n"
          : formatCurrency(sbmUhLuarKota) + "\n";
        jumlah += hDalamKota
          ? formatCurrency(uhDalamKota) + "\n"
          : formatCurrency(uhLuarKota) + "\n";

        total = hDalamKota ? total + uhDalamKota : total + uhLuarKota;
      }

      if (hFulldayHalfday) {
        jenis += "FHD\n";
        hr += hFulldayHalfday.toString() + "\n";
        besaran += formatCurrency(sbmUhFulldayHalfday) + "\n";
        jumlah += formatCurrency(uhFulldayHalfday) + "\n";
        total = total + uhFulldayHalfday;
      }

      if (hFullboard) {
        jenis += "FB\n";
        hr += hFullboard.toString() + "\n";
        besaran += formatCurrency(sbmUhFullboard) + "\n";
        jumlah += formatCurrency(uhFullboard) + "\n";
        total = total + uhFullboard;
      }

      if (hDiklat) {
        jenis += "Diklat\n";
        hr += hDiklat.toString() + "\n";
        besaran += formatCurrency(sbmUhDiklat) + "\n";
        jumlah += formatCurrency(uhDiklat) + "\n";
        total = total + uhDiklat;
      }

      // besaran = peserta.uhDalamNegeri.besaran;
      // jumlah = peserta.uhDalamNegeri.jumlah;
      // persentase = peserta.uhDalamNegeri.persentase;
      // total = peserta.uhDalamNegeri.total;
    }

    return {
      no: n.toString(),
      jenis,
      hr,
      besaran,
      jumlah,
      persentase,
      total,
      namaNipNpwp: namaNipNpwp,
      bankConcated: bank,
    };
  });

  const dataGroup: DataGroup[] = [
    {
      nama: "",
      groupMembers: rows,
    },
  ];

  // const jadwal1: DataGroup = {
  //   nama: "Kelas A",
  //   groupMembers: rows,
  // };

  // const jadwals = [jadwal1];

  const tableOptions: TableOptions = {
    startX: 30,
    startY: 75,
    startYonFirstPage: 130,
    headerRowHeight: 25,
    headerNumberingRowHeight: 15,
    dataRowHeight: 60,
  };
  try {
    const satker = "Pusat Pendidikan dan Pelatihan ";
    const titleText = `DAFTAR NOMINATIF UANG HARIAN`;
    const subtitleText = kegiatan.nama.toUpperCase();

    const hariIni = formatTanggal(new Date());

    const footerOptions: TableFooterOptions = {
      kiri: {
        text: "Mengetahui/Menyetujui\nPejabat Pembuat Komitmen:",
        nama: ppk?.nama ?? "",
        NIP: ppk?.NIP ?? "",
      },
      kanan: {
        text: `Yang Membayarkan,\nBendaharaPengeluaran`,
        nama: bendahara?.nama ?? "",
        NIP: bendahara?.NIP ?? "",
      },
      placeAndDateText: {
        place: "Jakarta, ",
        date: hariIni,
        position: "kanan",
      },
    };

    const tabelDinamisOptions: TableDinamisOptions = {
      layout: "portrait",
      satker,
      tableTitle: titleText,
      tableSubtitle: subtitleText,
      tableData: dataGroup,
      tableColumnHeaders: columns,
      tableOptions: tableOptions,
      tableFooterOptions: footerOptions,
    };
    const { pdfBuffer, summableColumns, pageSumsArray } =
      await generateTabelDinamis(tabelDinamisOptions);

    const summableFields = summableColumns.map((column) => column.field);

    // Calculate the sums and map to summableFields
    const summedFields = sumPageSumsArray(pageSumsArray, summableFields);

    const uraian = `UH DN kegiatan ${kegiatan.nama} di ${kegiatan.provinsi?.nama}`;

    // update riwayat pengajuan
    const updateRiwayatPengajuan = await dbHonorarium.riwayatPengajuan.update({
      where: {
        id: riwayatPengajuan.id,
      },
      data: {
        extraInfo: {
          uraian: uraian as unknown as InputJsonValue,
          summedFields: summedFields as unknown as InputJsonValue,
          summableFields: summableFields as unknown as InputJsonValue,
          pageSumsArray: pageSumsArray as unknown as InputJsonValue,
          dataGroup: dataGroup as unknown as InputJsonValue, // Convert jadwals to a JSON-compatible value
        },
      },
    });

    // Save the complete PDF to the file system
    console.log("[write file]", dokumenNominatif.filePath);
    await fs.writeFile(dokumenNominatif.filePath, pdfBuffer);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // "Content-Disposition": 'attachment; filename="payroll.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error", { status: 200 });
  }
}

interface DokumenNominatif {
  isFinal: boolean;
  filePath: string | null;
  isFileExist: boolean;
  file?: Buffer;
}
const getDokumenNominatif = async (
  kegiatan: Kegiatan,
  riwayatPengajuan: RiwayatPengajuan
) => {
  const tahunKegiatan = kegiatan.tanggalMulai.getFullYear().toString();
  const inStatus: STATUS_PENGAJUAN[] = [
    STATUS_PENGAJUAN.REQUEST_TO_PAY,
    STATUS_PENGAJUAN.PAID,
    STATUS_PENGAJUAN.END,
  ];

  const dokumenNominatif: DokumenNominatif = {
    isFinal: false,
    filePath: null,
    isFileExist: false,
  };

  dokumenNominatif.isFinal = inStatus.includes(riwayatPengajuan.status);
  let filePath = "";
  if (riwayatPengajuan.dokumenNominatif) {
    filePath = riwayatPengajuan.dokumenNominatif;
  } else {
    const filename = `draft-nominatif-${kegiatan.id}.pdf`;
    filePath = path.posix.join(tahunKegiatan, kegiatan.id, filename);
  }

  const fileFullPath = path.posix.join(BASE_PATH_UPLOAD, filePath);
  const dirPath = path.dirname(fileFullPath);
  try {
    await fs.mkdir(dirPath, { recursive: true });
    //console.log(`Directory ${dirPath} created or already exists.`);
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
  try {
    await fs.access(fileFullPath);
    dokumenNominatif.isFileExist = true;
    const file = await fs.readFile(fileFullPath);
    dokumenNominatif.file = file;
  } catch (error) {
    console.error(error);
    dokumenNominatif.isFileExist = false;
  }

  dokumenNominatif.filePath = path.resolve(fileFullPath);
  console.log("[fileFullPath_resolved]", dokumenNominatif.filePath);
  return dokumenNominatif;
};

export async function downloadNominatifUhDalamNegeri(
  req: Request,
  slug: string[]
) {
  return await generateDaftarNominatif(req, slug);
}

export default downloadNominatifUhDalamNegeri;
