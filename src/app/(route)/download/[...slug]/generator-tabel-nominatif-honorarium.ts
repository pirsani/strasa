import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import generateTabelDinamis, {
  DataGroup,
  TableColumnHeader,
  TableDinamisOptions,
  TableFooterOptions,
  TableOptions,
  TableRow,
} from "@/lib/pdf/tabel-nominatif-dinamis";
import { formatTanggal } from "@/utils/date-format";
import {
  Jadwal,
  Kegiatan,
  RiwayatPengajuan,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";
import Decimal from "decimal.js";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { Logger } from "tslog";
import { sumPageSumsArray } from "./utils";

const logger = new Logger({
  hideLogPositionForProduction: true,
});

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
    header: "NAMA/NIK/NPWP",
    headerNumberingString: "2",
    field: "namaNipNpwp",
    width: 120,
    align: "left",
  },
  {
    level: 1,
    header: "JABATAN",
    headerNumberingString: "3",
    field: "jabatan",
    width: 90,
    align: "left",
  },
  {
    level: 1,
    header: "HONORARIUM",
    width: 185,
    align: "center",
    subHeader: [
      {
        level: 2,
        header: "JP",
        headerNumberingString: "4",
        field: "jp",
        isSummable: true,
        width: 35,
        align: "center",
      },
      {
        level: 2,
        header: "BESARAN",
        headerNumberingString: "5",
        field: "besaran",
        isSummable: true,
        format: "currency",
        currency: "IDR",
        width: 75,
        align: "right",
      },
      {
        level: 2,
        header: "JUMLAH",
        headerNumberingString: "6=4x5",
        field: "jumlahBruto",
        format: "currency",
        currency: "IDR",
        isSummable: true,
        width: 75,
        align: "right",
      },
    ],
  },
  {
    level: 1,
    header: "PAJAK PENGHASILAN",
    width: 180,
    align: "center",
    subHeader: [
      {
        level: 2,
        header: "DPP",
        headerNumberingString: "7",
        field: "dpp",
        format: "currency",
        currency: "IDR",
        isSummable: true,
        width: 75,
        align: "right",
      },
      {
        level: 2,
        header: "TARIF",
        headerNumberingString: "8",
        field: "tarif",
        width: 35,
        align: "right",
      },
      {
        level: 2,
        header: "PPH 21 YANG DIPOTONG",
        headerNumberingString: "9=6x8",
        field: "pph",
        format: "currency",
        currency: "IDR",
        isSummable: true,
        width: 70,
        align: "right",
      },
    ],
  },
  {
    level: 1,
    header: "JUMLAH YANG DITERIMA",
    headerNumberingString: "10=6-9",
    field: "jumlahNetto",
    format: "currency",
    currency: "IDR",
    isSummable: true,
    width: 75,
    align: "center",
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
  const jadwalId = slug[2];
  // const bendaharaId = slug[3];
  // const ppkId = slug[4];

  const kegiatan = await dbHonorarium.kegiatan.findFirst({
    where: {
      id: kegiatanId,
    },
  });

  // const jadwalNarasumber = await dbHonorarium.jadwalNarasumber.findMany({
  //   where: {
  //     jadwalId: jadwalId,
  //   },
  //   include: {
  //     narasumber: true,
  //     jadwal: {
  //       include: {
  //         kegiatan: true,
  //       },
  //     },
  //   },
  // });

  const jadwal = await dbHonorarium.jadwal.findMany({
    where: {
      id: jadwalId,
      kegiatanId: kegiatanId,
    },
    include: {
      kelas: true,
      materi: true,
      jadwalNarasumber: {
        include: {
          narasumber: true,
        },
      },
    },
  });

  if (!kegiatan || !jadwal) {
    return new NextResponse("Kegiatan not found", { status: 404 });
  }

  const jadwal0 = jadwal[0];
  const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findFirst({
    where: {
      id: jadwal0.riwayatPengajuanId!,
      //jenis: "NOMINATIF",
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
    jadwal0,
    riwayatPengajuan
  );

  if (
    dokumenNominatif.isFileExist &&
    dokumenNominatif.file &&
    dokumenNominatif.isFinal
  ) {
    console.log("[file exist]", dokumenNominatif.filePath);
    const uint8Array = new Uint8Array(dokumenNominatif.file);
    return new NextResponse(uint8Array, {
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

  const bendahara = riwayatPengajuan?.bendahara;
  const ppk = riwayatPengajuan?.ppk;

  type InputJsonValue =
    | string
    | number
    | boolean
    | null
    | { [key: string]: InputJsonValue }
    | InputJsonValue[];

  const arrayParaNarasumber = jadwal0.jadwalNarasumber.map(
    (jadwalNarasumber) => jadwalNarasumber.narasumber?.nama
  );

  const paraNarasumber = arrayParaNarasumber.join(", ");

  const jadwals: DataGroup[] = jadwal.map((jadwal) => {
    const jadwalNarasumber = jadwal.jadwalNarasumber;
    let n = 0;
    const rows: TableRow[] = jadwalNarasumber.map((jadwalNarasumber) => {
      n += 1;
      const namaNipNpwp =
        jadwalNarasumber.narasumber?.nama +
        "\n" +
        jadwalNarasumber.narasumber.id +
        "\n" +
        jadwalNarasumber.narasumber?.pangkatGolonganId +
        "\n" +
        jadwalNarasumber.narasumber?.NPWP;

      const jp = jadwalNarasumber.jumlahJamPelajaran || new Decimal(0);
      const besaran = jadwalNarasumber.besaranHonorarium || new Decimal(0);
      const pajakTarif = jadwalNarasumber.pajakTarif || new Decimal(0);

      if (jp.lte(0) || besaran.lte(0)) {
        //throw new Error("Jumlah jam pelajaran atau besaran honorarium kosong");
        logger.warn(`Jumlah jam pelajaran atau besaran honorarium kosong`);
      }

      const tarif = pajakTarif.times(100);
      const jumlahBruto = jp.times(besaran);
      const bank =
        jadwalNarasumber.narasumber?.namaRekening +
        "\n" +
        jadwalNarasumber.narasumber?.bank +
        "\n" +
        jadwalNarasumber.narasumber?.nomorRekening;
      console.log(jp, besaran, jp.times(besaran));
      return {
        no: n.toString(),
        namaNipNpwp: namaNipNpwp,
        jabatan: jadwalNarasumber.narasumber?.jabatan,
        jp: jadwalNarasumber.jumlahJamPelajaran?.toString() || "0",
        besaran: jadwalNarasumber.besaranHonorarium?.toString() || "0",
        jumlahBruto: jumlahBruto.toString(),
        dpp: jadwalNarasumber.pajakDPP?.toString() || "0",
        tarif: tarif.toString() + "%",
        pph: jadwalNarasumber.pph21?.toString() || "0",
        jumlahNetto: jadwalNarasumber.jumlahDiterima?.toString() || "0",
        bankConcated: bank,
      };
    });

    return {
      nama:
        formatTanggal(jadwal.tanggal) +
        " -- " +
        jadwal.kelas?.nama +
        " -- " +
        jadwal.materi?.nama,
      groupMembers: rows,
    };
  });

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

  const hariIni = formatTanggal(new Date());
  const footerOptions: TableFooterOptions = {
    kiri: {
      text: "Mengetahui,\nPejabat Pembuat Komitmen",
      nama: ppk?.nama || "-",
      NIP: ppk?.NIP || "-",
    },
    kanan: {
      text: `Jakarta, ${hariIni}\nYang Membayarkan`,
      nama: bendahara?.nama || "-",
      NIP: bendahara?.NIP || "-",
    },
  };

  try {
    const satker = "Pusat Pendidikan dan Pelatihan ";
    const titleText = `DAFTAR NOMINATIF HONORARIUM NARASUMBER/PEMBAHAS PAKAR/ PRAKTISI/ PROFESIONAL`;
    const subtitleText = kegiatan.nama.toUpperCase();

    const tabelDinamisOptions: TableDinamisOptions = {
      satker,
      tableTitle: titleText,
      tableSubtitle: subtitleText,
      tableData: jadwals,
      tableColumnHeaders: columns,
      tableOptions: tableOptions,
      tableFooterOptions: footerOptions,
    };
    const { pdfBuffer, pageSumsArray, summableColumns } =
      await generateTabelDinamis(tabelDinamisOptions);

    const summableFields = summableColumns.map((column) => column.field);
    // Calculate the sums and map to summableFields
    const summedFields = sumPageSumsArray(pageSumsArray, summableFields);
    // update riwayat pengajuan
    // Explicitly create the extraInfo object with properties in the desired order
    const uraian = `Honorarium ${paraNarasumber} - ${jadwal0.kelas?.nama} - ${jadwal0.materi?.nama}`;
    const extraInfo: { [key: string]: InputJsonValue } = {
      uraian: uraian as unknown as InputJsonValue,
      summedFields: summedFields as unknown as InputJsonValue,
      summableFields: summableFields as unknown as InputJsonValue,
      pageSumsArray: pageSumsArray as unknown as InputJsonValue,
      jadwals: jadwals as unknown as InputJsonValue,
    };

    const updateRiwayatPengajuan = await dbHonorarium.riwayatPengajuan.update({
      where: {
        id: riwayatPengajuan.id,
      },
      data: {
        extraInfo: extraInfo,
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
    throw new Error("Failed to generate PDF");
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
  jadwal: Jadwal,
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
    const filename = `draft-nominatif-${jadwal.id}.pdf`;
    filePath = path.posix.join(
      tahunKegiatan,
      kegiatan.id,
      "jadwal-kelas-narasumber",
      jadwal.id,
      filename
    );
  }

  const fileFullPath = path.posix.join(BASE_PATH_UPLOAD, filePath);
  // create directory if not exist
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
  console.log("[dokumenNominatif]", dokumenNominatif.filePath);
  return dokumenNominatif;
};

export async function downloadNominatifHonorarium(
  req: Request,
  slug: string[]
) {
  return await generateDaftarNominatif(req, slug);
}

export default downloadNominatifHonorarium;
