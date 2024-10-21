import {
  getKegiatanById,
  getKegiatanIncludeSpd,
  KegiatanIncludeSpd,
} from "@/data/kegiatan";
import { dbHonorarium } from "@/lib/db-honorarium";
import { LOKASI, PejabatPerbendaharaan } from "@prisma-honorarium/client";
import { format } from "date-fns";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { PDFDocument, PDFForm } from "pdf-lib";
import { generateSpdHalaman1 } from "./generator-spd";
import { generateSpdDaftarPeserta } from "./generator-spd-daftar-peserta";

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

  dari1: string;
  ke1: string;
  dari1tanggal: string;

  tiba2: string;
  tiba2tanggal: string;
  dari2: string;
  ke2: string;
  dari2tanggal: string;

  tiba3?: string;
  tiba3tanggal?: string;
  dari3?: string;
  ke3?: string;
  dari3tanggal?: string;

  tiba4?: string;
  tiba4tanggal?: string;
  dar4?: string;
  ke4?: string;
  dari4tanggal?: string;

  tiba5?: string;
  tiba5tanggal?: string;
  dar5?: string;
  ke5?: string;
  dari5tanggal?: string;

  tiba6: string;
  tiba6tanggal: string;
}

const getDataRampungan = async (
  kegiatanId: string,
  ppk: PejabatPerbendaharaan
): Promise<RampunganData | null> => {
  const kegiatan = await getKegiatanById(kegiatanId);

  if (!kegiatan) {
    return null;
  }

  const rampunganData: RampunganData = {
    namaPeserta: "Fulan",
    //kegiatanId: kegiatan?.id,
    namaPpk: "si Fulan",
    nipPpk: "1234567890",

    dari1: "Jakarta, DKI Jakarta",
    ke1: "Bogor, Jawa Barat",
    dari1tanggal: "10 Januari 2022",

    tiba2: "Bogor, Jawa Barat",
    tiba2tanggal: "10 Januari 2022",
    dari2: "Bogor, Jawa Barat",
    ke2: "Jakarta, DKI Jakarta",
    dari2tanggal: "12 Januari 2022",

    tiba6: "Jakarta, DKI Jakarta",
    tiba6tanggal: "12 Januari 2022",
  };

  return rampunganData;
};

async function generateDataRampungan(kegiatan: KegiatanIncludeSpd) {
  const { ppk, spd, provinsi } = kegiatan;

  if (!ppk || !spd) {
    throw new Error("PPK or SPD not found");
  }

  const kota = kegiatan.kota?.split(";")[1] ?? ""; // di database disimpan dengan format idKota;nama
  let tujuan = "";
  if (kegiatan.lokasi !== LOKASI.LUAR_NEGERI) {
    tujuan = kota + ", " + kegiatan.provinsi?.nama;
  }

  const peserta = await dbHonorarium.pesertaKegiatan.findMany({
    where: {
      kegiatanId: kegiatan.id,
    },
  });

  const rampunganDataArray: RampunganData[] = peserta.map((peserta) => {
    return {
      namaPeserta: peserta.nama,

      namaPpk: ppk.nama,
      nipPpk: ppk.NIP || "-",

      dari1: "Jakarta, DKI Jakarta",
      ke1: tujuan,
      dari1tanggal: format(kegiatan.tanggalMulai, "dd MMMM yyyy"),

      tiba2: tujuan,
      tiba2tanggal: format(kegiatan.tanggalMulai, "dd MMMM yyyy"),
      dari2: tujuan,
      ke2: "Jakarta, DKI Jakarta",
      dari2tanggal: format(kegiatan.tanggalSelesai, "dd MMMM yyyy"),

      tiba6: "Jakarta, DKI Jakarta",
      tiba6tanggal: format(kegiatan.tanggalSelesai, "dd MMMM yyyy"),
    };
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

    const spdHalaman1 = await generateSpdHalaman1(kegiatan);
    const spdHalaman2 = await generateSpdHalaman2(kegiatan);

    const spdDaftarPeserta = await generateSpdDaftarPeserta(kegiatan);

    const satuplusdua = await mergePdfs(spdHalaman1, spdHalaman2);
    const completePdfBytes = await mergePdfs(satuplusdua, spdDaftarPeserta);

    return new NextResponse(completePdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        //"Content-Disposition": 'attachment; filename="f1.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}

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

export default GeneratorRampungan;
