import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { NextResponse } from "next/server";
import { downloadDokumenAkhir } from "./dokumen-akhir";
import { downloadDokumenBuktiPembayaran } from "./dokumen-bukti-pembayaran";
import {
  downloadDokumenDaftarHadir,
  downloadDokumenUndanganNarasumber,
} from "./dokumen-jadwal";
import downloadDokumenKegiatan from "./dokumen-kegiatan";
import downloadDokumenNarasumber, {
  downloadDokumenBuktiPembayaranNarasumber,
  downloadDokumenKonfirmasiKesediaanMengajar,
} from "./dokumen-narasumber";
import downloadDokumenPeserta from "./dokumen-peserta";
import { downloadDokumenPengadaan } from "./generator-dokumen-pengadaan";
import { downloadExcelPembayaran } from "./generator-excel-pembayaran";
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
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const slug = (await params).slug;
    // console.log(slug);

    const jenisDokumen = slug[0];
    // console.log(jenisDokumen);

    const pengguna = await getSessionPenggunaForAction();
    if (!pengguna.success) {
      // it should never happen because it already checked in middleware
      throw new Error("User not found");
    }
    // TODO memastikan bahwa pengguna yang mengajukan adalah satker pengguna yang terkait dengan kegiatan

    const dataPengguna = pengguna.data;

    const { satkerId, unitKerjaId, penggunaId, penggunaName } = dataPengguna;

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
      case "peserta":
        return downloadDokumenPeserta(req, slug);
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
      case "dokumen-akhir":
        return downloadDokumenAkhir(req, slug);
      case "excel-pembayaran":
        return downloadExcelPembayaran(req, slug, dataPengguna);
      case "dokumen-undangan-narasumber":
        return downloadDokumenUndanganNarasumber(req, slug);
      case "dokumen-daftar-hadir":
        return downloadDokumenDaftarHadir(req, slug);
      default:
        return new NextResponse(`Invalid Download Request ${slug.join("/")}`, {
          status: 404,
        });
    }
  } catch (error) {
    console.error(error);
    const customError = error as Error;
    return new NextResponse(`Download error: ${customError.message}`);
  }
}

// Function to update the Word template
