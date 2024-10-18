import { error } from "console";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { PDFDocument } from "pdf-lib";

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
      console.log(setTextField, name, text);
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
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        //"Content-Disposition": 'attachment; filename="f1.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
  }
  return new NextResponse("TEST ", { status: 200 });
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
  return fillFormSpd(dataSpd);
}
