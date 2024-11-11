import { NextResponse } from "next/server";
import { downloadDokumenBuktiPembayaran } from "./dokumen-bukti-pembayaran";
import downloadDokumenKegiatan from "./dokumen-kegiatan";
import downloadDokumenNarasumber, {
  downloadDokumenBuktiPembayaranNarasumber,
  downloadDokumenKonfirmasiKesediaanMengajar,
} from "./dokumen-narasumber";
import { downloadDokumenPengadaan } from "./generator-dokumen-pengadaan";
import { downloadDokumenRampungan } from "./generator-rampungan";
import { downloadDokumenSpd } from "./generator-spd";
import downloadSpdDaftarPeserta from "./generator-spd-daftar-peserta";
import { downloadTest } from "./generator-tabel-nominatif";
import downloadNominatifHonorarium from "./generator-tabel-nominatif-honorarium";
import downloadNominatifUhDalamNegeri from "./generator-tabel-nominatif-uh-dalam-negeri";
import downloadNominatifUhLuarNegeri from "./generator-tabel-nominatif-uh-luar-negeri";
import { downloadTemplateExcel } from "./template-excel";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const { slug } = params;
  console.log(slug);

  const jenisDokumen = slug[0];
  console.log(jenisDokumen);

  try {
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
      case "nominatif-honorarium":
        return downloadNominatifHonorarium(req, slug);
      case "nominatif-uh-dalam-negeri":
        return downloadNominatifUhDalamNegeri(req, slug);
      case "nominatif-uh-luar-negeri":
        return downloadNominatifUhLuarNegeri(req, slug);
      case "spd-peserta":
        return downloadSpdDaftarPeserta(req, slug);
      case "konfirmasi-kesediaan-mengajar":
        return downloadDokumenKonfirmasiKesediaanMengajar(req, slug);
      case "bukti-pembayaran":
        return downloadDokumenBuktiPembayaran(req, slug);
      case "bukti-pembayaran-narasumber":
        return downloadDokumenBuktiPembayaranNarasumber(req, slug);
      default:
        return new NextResponse(`Download ${params.slug.join("/")}`);
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Error", { status: 200 });
  }
}

// Function to update the Word template
