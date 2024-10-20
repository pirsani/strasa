import { NextResponse } from "next/server";
import downloadDokumenKegiatan from "./dokumen-kegiatan";
import downloadDokumenNarasumber from "./dokumen-narasumber";
import { downloadDokumenPengadaan } from "./generator-dokumen-pengadaan";
import { downloadDokumenRampungan } from "./generator-rampungan";
import { downloadDokumenSpd } from "./generator-spd";
import downloadSpdDaftarPeserta from "./generator-spd-daftar-peserta";
import { downloadTest } from "./generator-tabel-nominatif";
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
    case "dokumen-spd":
      return downloadDokumenSpd(req, slug);
    case "dokumen-rampungan":
      return downloadDokumenRampungan(req, slug);
    case "template-excel":
      return downloadTemplateExcel(req, slug);
    case "dokumen-kegiatan":
      return downloadDokumenKegiatan(req, slug);
    case "narasumber":
      return downloadDokumenNarasumber(req, slug);
    case "test":
      return downloadTest(req, slug);
    case "spd-peserta":
      return downloadSpdDaftarPeserta(req, slug);
    default:
      return new NextResponse(`Download ${params.slug.join("/")}`);
  }
}

// Function to update the Word template
