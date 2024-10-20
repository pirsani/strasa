import { KegiatanIncludeSpd } from "@/data/kegiatan";
import { formatTanggal } from "@/utils/date-format";
import { LOKASI } from "@prisma-honorarium/client";
import { JsonValue } from "@prisma-honorarium/client/runtime/library";
import { error } from "console";
import { differenceInDays } from "date-fns";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { Logger } from "tslog";

const logger = new Logger({
  name: "[SPD-HALAMAN-1]",
  hideLogPositionForProduction: true,
});

interface SpdTextfield {
  nomor: string;
  ppk: string;
  namaKegiatan: string;
  tujuan: string;
  jumlahHari: string;
  tanggalBerangkat: string;
  tanggalKembaliTiba: string;
  satker: string;
  akun: string;
  tanggalDikeluarkan: string; // tanggal dikeluarkan
  ttdPpkNama: string;
  ttdPpkNip: string;
  keterangan: string;
}

const fillFormSpd = async (spdData: SpdTextfield) => {
  const pdfTemplateLocation = "src/templates/pdf/spd-1.pdf";
  const resolvedPathPdfTemplate = path.resolve(pdfTemplateLocation);
  logger.info(resolvedPathPdfTemplate);
  logger.info("[spdData]", spdData);

  try {
    await fs.access(resolvedPathPdfTemplate, fs.constants.R_OK);
    const template = await fs.readFile(resolvedPathPdfTemplate);
    const pdfDoc = await PDFDocument.load(template);

    if (!pdfDoc) {
      throw error("Invalid PDF templat");
    }

    const form = pdfDoc.getForm();
    const fields = form.getFields().map((field) => field.getName());
    console.log("fields", fields);

    const setTextField = (name: string, text: string) => {
      //console.log(setTextField, name, text);
      const textField = form.getTextField(name);
      textField.setText(text);
      //textField.setFontSize(fontSize);
    };

    // iterate over all spdData and setTextField
    Object.entries(spdData).forEach(([key, value]) => {
      setTextField(key, value);
    });
    form.flatten();
    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  } catch (error) {
    logger.error(error);
    throw error;
  }
  //return new NextResponse("TEST ", { status: 200 });
};

export async function downloadDokumenSpd(req: Request, slug: string[]) {
  // slug[0] is the document type, slug[1] is the kegiatanId
  // check if slug[1] is exist and is a number
  if (!slug[1]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const kegiatanId = slug[1];
  //const kegiatan = await getKegiatanById(kegiatanId);
  //const dataSpd = await getDataSpd(kegiatanId);
  const dataSpd: SpdTextfield = {
    nomor: "nosdasd",
    akun: "343243",
    tujuan: "Banten",
    jumlahHari: "14",
    keterangan:
      "Nomor Surat Tugas: 23093/334/244/23/18 \n tanggal 10 Desember 2024",
    namaKegiatan: "Kegiatan di pulau dewata",
    ppk: "fulan bin bulan",
    satker: "Pusdiklat Kementerian Luar Negeri",
    tanggalDikeluarkan: "11 Desember 2024",
    tanggalBerangkat: "13 Desember 2024",
    tanggalKembaliTiba: "27 Desember 2024",
    ttdPpkNama: "Fulan bin bulan",
    ttdPpkNip: "19343484848483",
  };
  console.log(dataSpd);
  const pdfBytes = await fillFormSpd(dataSpd);
  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      //"Content-Disposition": 'attachment; filename="f1.pdf"',
    },
  });
}

const findValueInAsWas = (asWas: JsonValue, key: string): any => {
  // Ensure that asWas is an object (not null or primitive) before accessing the key
  if (asWas && typeof asWas === "object" && !Array.isArray(asWas)) {
    return (asWas as Record<string, any>)[key];
  }
  return undefined;
};

export const generateSpdHalaman1 = async (kegiatan: KegiatanIncludeSpd) => {
  const { ppk, spd } = kegiatan;
  if (!ppk || !spd) {
    throw new Error("PPK or SPD not found");
  }
  const akun = findValueInAsWas(spd.asWas, "akun") ?? "-";
  const keterangan = findValueInAsWas(spd.asWas, "keterangan") ?? "-";
  const kota = kegiatan.kota?.split(";")[1] ?? ""; // di database disimpan dengan format idKota;nama
  let tujuan = "";
  if (kegiatan.lokasi !== LOKASI.LUAR_NEGERI) {
    tujuan = kota + ", " + kegiatan.provinsi?.nama;
  }
  // find value of akun in aswas

  const jumlahHari =
    1 +
    differenceInDays(
      new Date(kegiatan.tanggalSelesai),
      new Date(kegiatan.tanggalMulai)
    );
  const satker = kegiatan.satker.singkatan ?? kegiatan.satker.nama;
  const dataSpd: SpdTextfield = {
    nomor: spd.nomorSPD,
    akun: akun,
    tujuan: tujuan,
    jumlahHari: jumlahHari.toString(),
    keterangan: keterangan,
    namaKegiatan: kegiatan.nama,
    ppk: ppk.nama,
    satker: satker + " - " + "Kementerian Luar Negeri",
    tanggalDikeluarkan: formatTanggal(
      spd.updatedAt ?? spd.createdAt,
      "dd MMMM yyyy"
    ),
    tanggalBerangkat: formatTanggal(kegiatan.tanggalMulai, "dd MMMM yyyy"),
    tanggalKembaliTiba: formatTanggal(kegiatan.tanggalSelesai, "dd MMMM yyyy"),
    ttdPpkNama: ppk.nama,
    ttdPpkNip: ppk.NIP || "-", // NIP is optional
  };
  try {
    const pdfBytes = await fillFormSpd(dataSpd);
    return pdfBytes;
  } catch (error) {
    throw error;
  }
};
