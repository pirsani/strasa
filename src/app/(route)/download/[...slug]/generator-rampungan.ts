import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { getKegiatanIncludeSpd, KegiatanIncludeSpd } from "@/data/kegiatan";
import { getRiwayatPengajuanRampunganByKegiatanId } from "@/data/kegiatan/riwayat-pengajuan";
import { dbHonorarium } from "@/lib/db-honorarium";
import { formatTanggal } from "@/utils/date-format";
import { LOKASI } from "@prisma-honorarium/client";
import { format } from "date-fns";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { PDFDocument, PDFForm } from "pdf-lib";
import { Logger } from "tslog";
import { generateSpdHalaman1 } from "./generator-spd";
import { generateSpdDaftarPeserta } from "./generator-spd-daftar-peserta";

const logger = new Logger({
  name: "[RAMPUNGAN]",
  hideLogPositionForProduction: true,
});

// Fungsi generator rampungan memerlukan data peserta kegiatan untuk diisi ke dalam form
// Fungsi fillFormRampungan digunakan untuk mengisi form rampungan dengan data kegiatan

const GeneratorRampungan = () => {
  return true;
};

// format dari dan ke adalah [ kota, provinsi ]
// tiba dan dari sama untu dari[x] dan ke[x]
// dar1 = ke6 adalah tempat kedudukan
interface RampunganData {
  //kegiatanId: string;

  namaPeserta: string;

  namaPpk: string;
  nipPpk: string;

  dariKedudukan: string;
  dariKedudukanTanggal?: string;

  dari1: string;
  ke1?: string;
  dari1tanggal?: string;

  tiba2?: string;
  tiba2tanggal?: string;
  dari2?: string;
  ke2?: string;
  dari2tanggal?: string;

  tiba3?: string;
  tiba3tanggal?: string;
  dari3?: string;
  ke3?: string;
  dari3tanggal?: string;

  tiba4?: string;
  tiba4tanggal?: string;
  dari4?: string;
  ke4?: string;
  dari4tanggal?: string;

  tiba5?: string;
  tiba5tanggal?: string;
  dari5?: string;
  ke5?: string;
  dari5tanggal?: string;

  tiba6?: string;
  tiba6tanggal?: string;
  dari6?: string;
  ke6?: string;
  dari6tanggal?: string;

  tiba7?: string;
  tiba7tanggal?: string;
  dari7?: string;
  ke7?: string;
  dari7tanggal?: string;

  tiba8?: string;
  tiba8tanggal?: string;
  dari8?: string;
  ke8?: string;
  dari8tanggal?: string;

  tiba9?: string;
  tiba9tanggal?: string;
  dari9?: string;
  ke9?: string;
  dari9tanggal?: string;

  tiba10?: string;
  tiba10tanggal?: string;
  dari10?: string;
  ke10?: string;
  dari10tanggal?: string;

  tiba11?: string;
  tiba11tanggal?: string;
  dari11?: string;
  ke11?: string;
  dari11tanggal?: string;

  tiba12?: string;
  tiba12tanggal?: string;

  tibaDiKedudukan?: string;
  tibaDiKedudukanTanggal?: string;
}

async function generateDataRampungan(kegiatan: KegiatanIncludeSpd) {
  const { ppk, spd, provinsi, pesertaKegiatan: peserta } = kegiatan;

  if (!ppk || !spd) {
    throw new Error("PPK or SPD not found");
  }

  if (!peserta || peserta.length === 0) {
    throw new Error("Peserta kegiatan not found");
  }

  const kota = kegiatan.kota?.split(";")[1] ?? ""; // di database disimpan dengan format idKota;nama
  let tujuan = "";
  if (kegiatan.lokasi !== LOKASI.LUAR_NEGERI) {
    tujuan = kota + ", " + kegiatan.provinsi?.nama;
  }

  //const peserta = kegiatan.pesertaKegiatan;
  // const peserta = await dbHonorarium.pesertaKegiatan.findMany({
  //   where: {
  //     kegiatanId: kegiatan.id,
  //   },
  // });

  const rampunganDataArray: RampunganData[] = peserta.map((peserta) => {
    return {
      namaPeserta: peserta.nama,

      namaPpk: ppk.nama,
      nipPpk: ppk.NIP || "-",

      dariKedudukan: "Jakarta, DKI Jakarta",
      dariKedudukanTanggal: format(kegiatan.tanggalMulai, "dd MMMM yyyy"),

      dari1: "Jakarta, DKI Jakarta",
      ke1: tujuan,
      dari1tanggal: format(kegiatan.tanggalMulai, "dd MMMM yyyy"),

      tiba1: tujuan,
      tiba1tanggal: format(kegiatan.tanggalMulai, "dd MMMM yyyy"),

      dari2tanggal: format(kegiatan.tanggalSelesai, "dd MMMM yyyy"),
      ke2: "Jakarta, DKI Jakarta",
      dari2: tujuan,
      tiba2: "Jakarta, DKI Jakarta",
      tiba2tanggal: format(kegiatan.tanggalSelesai, "dd MMMM yyyy"),

      tibaDiKedudukan: "Jakarta, DKI Jakarta",
      tibaDiKedudukanTanggal: format(kegiatan.tanggalSelesai, "dd MMMM yyyy"),
    };
  });

  return rampunganDataArray;
}

// saat ini hanya support multitujuan LN
async function generateDataRampunganMultiTujuan(kegiatan: KegiatanIncludeSpd) {
  const { ppk, spd, provinsi, pesertaKegiatan, itinerary } = kegiatan;

  if (!ppk || !spd) {
    throw new Error("PPK or SPD not found");
  }

  if (!itinerary || itinerary.length < 2) {
    throw new Error("Itinerary not found or less than 2");
  }

  const peserta = await dbHonorarium.pesertaKegiatan.findMany({
    where: {
      kegiatanId: kegiatan.id,
    },
    include: {
      uhLuarNegeri: {
        orderBy: {
          tanggalMulai: "asc",
        },
      },
    },
  });

  const rampunganDataArray: RampunganData[] = peserta.map((peserta) => {
    const uhPeserta = peserta.uhLuarNegeri;
    // if (!uhPeserta || uhPeserta.length === 0) {
    //   return;
    // }

    let rampunganData: RampunganData = {
      namaPeserta: peserta.nama,
      namaPpk: ppk.nama,
      nipPpk: ppk.NIP || "-",
      dari1: "Jakarta, DKI Jakarta",
      dariKedudukan: "Jakarta, DKI Jakarta",
    };

    let i = 1;
    uhPeserta.forEach((uh) => {
      logger.debug("forEach uh", uh);
      rampunganData = {
        ...rampunganData,

        [`dari${i}`]: uh.dariLokasiId,
        [`ke${i}`]: uh.keLokasiId,
        [`dari${i}tanggal`]: formatTanggal(uh.tanggalMulai),

        [`tiba${i}`]: uh.keLokasiId,
        [`tiba${i}tanggal`]: formatTanggal(uh.tanggalTiba),
      };
      i++;
    });
    // tibaDiKedudukan
    rampunganData = {
      ...rampunganData,
      [`dariKedudukanTanggal`]: rampunganData.dari1tanggal,
      [`tibaDiKedudukan`]: "Jakarta, DKI Jakarta",
      [`tibaDiKedudukanTanggal`]: format(
        uhPeserta[uhPeserta.length - 1].tanggalTiba,
        "dd MMMM yyyy"
      ),
    };

    return rampunganData;
  });

  return rampunganDataArray;
}

const fillFormRampungan = async (
  templatePath: string,
  rampunganDataArray: RampunganData[] | null
) => {
  if (!rampunganDataArray || rampunganDataArray.length === 0) {
    throw new Error("Rampungan data not found");
  }

  try {
    // Create a new PDF document to hold the filled pages
    const newPdfDoc = await PDFDocument.create();

    const setTextField = (form: PDFForm, name: string, text: string) => {
      try {
        const textField = form.getTextField(name);
        textField.setText(text);
      } catch (err) {
        //console.warn(`Field "${name}" not found or cannot be set`);
      }
    };

    // Iterate over all rampunganData
    for (const rampunganData of rampunganDataArray) {
      // Load the template document again for each entry to ensure a fresh form
      const template = await fs.readFile(templatePath);
      const templatePdfDoc = await PDFDocument.load(template);

      // Get the form from the fresh template document
      const templateForm = templatePdfDoc.getForm();

      // Get the fields to log for debugging purposes
      const fields = templateForm.getFields().map((field) => field.getName());
      //console.log("Fields in template form", fields);

      if (fields.length === 0) {
        throw new Error("No form fields found on the template page");
      }

      // Set form field values based on rampunganData
      Object.entries(rampunganData).forEach(([key, value]) => {
        if (fields.includes(key)) {
          setTextField(templateForm, key, value);
        } else {
          //console.warn(`Field "${key}" not found in the PDF form`);
        }
      });

      // Flatten the form fields on the current template
      templateForm.flatten();

      // Copy the filled and flattened page to the new PDF document
      const [copiedPage] = await newPdfDoc.copyPages(templatePdfDoc, [0]);
      newPdfDoc.addPage(copiedPage);
    }

    // Save the final PDF document with all pages
    const pdfBytes = await newPdfDoc.save();
    return pdfBytes;
  } catch (error) {
    throw error;
  }
};

export const generateSpdHalaman2 = async (kegiatan: KegiatanIncludeSpd) => {
  const { ppk, spd, itinerary } = kegiatan;
  if (!ppk || !spd) {
    throw new Error("PPK or SPD not found");
  }

  let isMultiTujuan = false;
  let dataRampunganArray: RampunganData[] = [];
  if (
    kegiatan.lokasi === LOKASI.LUAR_NEGERI &&
    itinerary &&
    itinerary.length > 1
  ) {
    isMultiTujuan = true;
  }

  if (isMultiTujuan) {
    logger.debug("isMultiTujuan", itinerary);
    dataRampunganArray = await generateDataRampunganMultiTujuan(kegiatan);
    console.log("dataRampunganArray MultiTujuan", dataRampunganArray);
  } else {
    dataRampunganArray = await generateDataRampungan(kegiatan);
  }

  if (!dataRampunganArray) {
    throw new Error("Rampungan data not found");
  }

  const pdfTemplateLocation = "src/templates/pdf/rampungan.pdf";
  const templatePath = path.resolve(process.cwd(), pdfTemplateLocation);
  await fs.access(templatePath, fs.constants.R_OK);

  const pdfBytes = await fillFormRampungan(templatePath, dataRampunganArray);

  //const pdfSpdBytes = await getPdfSpd(kegiatanId);
  return pdfBytes;
};

/**
 * untuk itinerary lebih dari 4 - 10
 */
export const generateSpdHalamanMultipage = async (
  kegiatan: KegiatanIncludeSpd
) => {
  const { ppk, spd } = kegiatan;
  if (!ppk || !spd) {
    throw new Error("PPK or SPD not found");
  }
  const dataRampunganArray = await generateDataRampungan(kegiatan);
  if (!dataRampunganArray) {
    throw new Error("Rampungan data not found");
  }

  const pdfTemplateLocation = "src/templates/pdf/rampungan.pdf";
  const templatePath = path.resolve(process.cwd(), pdfTemplateLocation);
  await fs.access(templatePath, fs.constants.R_OK);

  const pdfBytes = await fillFormRampungan(templatePath, dataRampunganArray);

  //const pdfSpdBytes = await getPdfSpd(kegiatanId);
  return pdfBytes;
};

export async function downloadDokumenRampungan(req: Request, slug: string[]) {
  // slug[0] is the document type, slug[1] is the kegiatanId
  // check if slug[1] is exist and is a number
  if (!slug[1]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  try {
    const kegiatanId = slug[1];
    const kegiatan = await getKegiatanIncludeSpd(kegiatanId);
    const ppk = kegiatan?.ppk;
    const spd = kegiatan?.spd;

    if (!kegiatan || !ppk || !spd) {
      return new NextResponse("PPK belum dipilih", { status: 404 });
    }

    // check if dokumen is already generated or already exist
    const dokumenRampungan = await getDokumenRampungan(kegiatan);
    if (
      dokumenRampungan.isFileExist &&
      dokumenRampungan.file &&
      dokumenRampungan.isFinal
    ) {
      return new NextResponse(dokumenRampungan.file, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename=${spd.id}.pdf`, // inline or attachment
        },
      });
    }

    if (!dokumenRampungan.filePath) {
      // it should not happen
      console.error("Rampungan file path not found");
      throw new Error("Rampungan file path not found");
    }

    const spdHalaman1 = await generateSpdHalaman1(kegiatan);
    const spdHalaman2 = await generateSpdHalaman2(kegiatan);

    const spdDaftarPeserta = await generateSpdDaftarPeserta(kegiatan);

    const satuplusdua = await mergePdfs(spdHalaman1, spdHalaman2);
    const completePdfBytes = await mergePdfs(satuplusdua, spdDaftarPeserta);

    // Save the complete PDF to the file system
    console.log("[write file]", dokumenRampungan.filePath);
    await fs.writeFile(dokumenRampungan.filePath, completePdfBytes);

    return new NextResponse(completePdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        //"Content-Disposition": 'attachment; filename="f1.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    const customeError = error instanceof Error ? error.message : "Error";
    return new NextResponse(`Failed to generate PDF, ${customeError}`, {
      status: 500,
    });
  }
}

interface RampunganDokumen {
  isFinal: boolean;
  filePath: string | null;
  isFileExist: boolean;
  file?: Buffer;
}
const getDokumenRampungan = async (kegiatan: KegiatanIncludeSpd) => {
  const tahunKegiatan = kegiatan.tanggalMulai.getFullYear().toString();
  let dokumenRampungan: RampunganDokumen = {
    isFinal: false,
    filePath: null,
    isFileExist: false,
  };
  const spd = kegiatan.spd;
  if (!spd) {
    return dokumenRampungan;
  }

  const riwayatPengajuan = await getRiwayatPengajuanRampunganByKegiatanId(
    kegiatan.id
  );

  if (!riwayatPengajuan) {
    console.error("Riwayat pengajuan rampungan not found");
    throw new Error("Riwayat pengajuan rampungan not found");
  }

  dokumenRampungan.isFinal = riwayatPengajuan.status === "END";

  // TODO: Jika nanti ada fitur untuk upload file rampungan yang telah ditanda tangani,
  // maka gunakan file yang diupload kolom yang disediakan di spd.dokumen

  let filePath = "";
  if (spd.dokumen) {
    filePath = spd.dokumen;
  } else {
    const filename = `draft-rampungan-${spd.id}.pdf`;
    filePath = path.posix.join(tahunKegiatan, kegiatan.id, filename);
  }

  const fileFullPath = path.posix.join(BASE_PATH_UPLOAD, filePath);
  try {
    await fs.access(fileFullPath, fs.constants.R_OK);
    dokumenRampungan.isFileExist = true;
    const file = await fs.readFile(fileFullPath);
    dokumenRampungan.file = file;
  } catch (error) {
    console.error(error);
    dokumenRampungan.isFileExist = false;
  }

  dokumenRampungan.filePath = path.posix.resolve(fileFullPath);
  console.log("[dokumenRampungan.filePath]", dokumenRampungan.filePath);
  return dokumenRampungan;
};

const mergePdfs = async (
  filledPdfBytes: Uint8Array,
  otherPdfBytes: Uint8Array
) => {
  // Load the filled PDF document
  const filledPdfDoc = await PDFDocument.load(filledPdfBytes);

  // Load the other PDF document to be added
  const otherPdfDoc = await PDFDocument.load(otherPdfBytes);

  // Create a new PDF document to hold the merged content
  const mergedPdfDoc = await PDFDocument.create();

  // Copy all pages from the filled PDF
  const filledPages = await mergedPdfDoc.copyPages(
    filledPdfDoc,
    filledPdfDoc.getPageIndices()
  );
  filledPages.forEach((page) => mergedPdfDoc.addPage(page));

  // Copy all pages from the other PDF
  const otherPages = await mergedPdfDoc.copyPages(
    otherPdfDoc,
    otherPdfDoc.getPageIndices()
  );
  otherPages.forEach((page) => mergedPdfDoc.addPage(page));

  // Save and return the merged PDF document bytes
  const mergedPdfBytes = await mergedPdfDoc.save();
  return mergedPdfBytes;
};
