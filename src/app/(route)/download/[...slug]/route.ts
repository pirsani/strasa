import { NextResponse } from "next/server";
import downloadDokumenKegiatan from "./dokumen-kegiatan";
import { downloadDokumenPengadaan } from "./generator-dokumen-pengadaan";
import { downloadDokumenRampungan } from "./generator-rampungan";
import { downloadTemplateExcel } from "./template-excel";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const { slug } = params;
  console.log(slug);

  const jenisDokumen = slug[0];
  console.log(jenisDokumen);

  switch (jenisDokumen) {
    case "dokumen-pengadaan":
      return downloadDokumenPengadaan(req, slug);
    case "dokumen-rampungan":
      return downloadDokumenRampungan(req, slug);
    case "template-excel":
      return downloadTemplateExcel(req, slug);
    case "dokumen-kegiatan":
      return downloadDokumenKegiatan(req, slug);
    default:
      return new NextResponse(`Download ${params.slug.join("/")}`);
  }
}

// Function to update the Word template
