import { getKegiatanById } from "@/actions/kegiatan";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";

// Fungsi generator rampungan memerlukan data peserta kegiatan untuk diisi ke dalam form
// Fungsi fillFormRampungan digunakan untuk mengisi form rampungan dengan data kegiatan

const GeneratorRampungan = () => {
  return true;
};

// format dari dan ke adalah [ kota, provinsi ]
// tiba dan dari sama untu dari[x] dan ke[x]
// dar1 = ke6 adalah tempat kedudukan
interface RampunganData {
  kegiatanId: string;
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
  kegiatanId: string
): Promise<RampunganData | null> => {
  const kegiatan = await getKegiatanById(kegiatanId);

  if (!kegiatan) {
    return null;
  }

  const rampunganData: RampunganData = {
    kegiatanId: kegiatan?.id,
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

const fillFormRampungan = async (rampunganData: RampunganData | null) => {
  if (!rampunganData) {
    return new NextResponse("Kegiatan not found", { status: 404 });
  }

  const pdfTemplateLocation = "src/templates/pdf/rampungan.pdf";
  const templatePath = path.resolve(process.cwd(), pdfTemplateLocation);

  try {
    await fs.access(templatePath, fs.constants.R_OK);

    const template = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(template);

    if (!pdfDoc) {
      return new NextResponse("Invalid PDF template", { status: 400 });
    }

    const form = pdfDoc.getForm();
    const fields = form.getFields().map((field) => field.getName());
    // Embed a standard font (Helvetica)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontsize = 8;

    console.log("fields", fields);

    const setTextField = (name: string, text: string, fontSize: number) => {
      const textField = form.getTextField(name);
      textField.setText(text);
      //textField.setFontSize(fontSize);
    };

    setTextField("namaPpk", rampunganData.namaPpk, fontsize);
    setTextField("nipPpk", rampunganData.nipPpk, fontsize);

    setTextField("dari1", rampunganData.dari1, fontsize);
    setTextField("ke1", rampunganData.ke1, fontsize);
    setTextField("dari1tanggal", rampunganData.dari1tanggal, fontsize);

    setTextField("tiba2", rampunganData.tiba2, fontsize);
    setTextField("tiba2tanggal", rampunganData.tiba2tanggal, fontsize);
    setTextField("dari2", rampunganData.dari2, fontsize);
    setTextField("ke2", rampunganData.ke2, fontsize);
    setTextField("dari2tanggal", rampunganData.dari2tanggal, fontsize);

    setTextField("tiba6", rampunganData.tiba6, fontsize);
    setTextField("tiba6tanggal", rampunganData.tiba6tanggal, fontsize);

    form.flatten();

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        //"Content-Disposition": 'attachment; filename="f1.pdf"',
      },
    });
  } catch {
    return new NextResponse("PDF template not found, contact administrator", {
      status: 400,
    });
  }
};

export async function downloadDokumenRampungan(req: Request, slug: string[]) {
  // slug[0] is the document type, slug[1] is the kegiatanId
  // check if slug[1] is exist and is a number
  if (!slug[1]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const kegiatanId = slug[1];
  //const kegiatan = await getKegiatanById(kegiatanId);
  const dataRampungan = await getDataRampungan(kegiatanId);
  return fillFormRampungan(dataRampungan);
}

export default GeneratorRampungan;
