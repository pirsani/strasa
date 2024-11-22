"use server";

import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { getRiwayatPengajuanByKegiatanIdAndJenisPengajuan } from "@/data/kegiatan/riwayat-pengajuan";
import {
  getObjPlainPembayaran,
  ObjPlainPembayaranIncludeKegiatan,
} from "@/data/pembayaran";
import { getJenisPengajuan } from "@/lib/constants";
import { dbHonorarium } from "@/lib/db-honorarium";
import { NominatifPembayaranWithoutFile } from "@/zod/schemas/nominatif-pembayaran";
import {
  JENIS_PENGAJUAN,
  Pembayaran,
  RiwayatPengajuan,
} from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { getTahunAnggranPilihan } from "../pengguna/preference";
import { ActionResponse } from "../response";
// ini akan merge dari data kegiatan dan data pengajuan pembayaran
export type { ObjPlainPembayaranIncludeKegiatan } from "@/data/pembayaran";
interface dataPengajuanPembayaran {
  id: string;
  jenisPengajuan: string;
  lokasi?: string;
}

export const getPengajuanPembayaran = async (): Promise<
  ActionResponse<ObjPlainPembayaranIncludeKegiatan[]>
> => {
  const pengguna = await getSessionPenggunaForAction();

  if (!pengguna.success) {
    return pengguna;
  }

  const tahun = await getTahunAnggranPilihan();
  const penggunaId = pengguna.data.penggunaId;
  const satkerId = pengguna.data.satkerId;
  const status = "RequestToPay";

  const dataPembayaran = await getObjPlainPembayaran(satkerId, tahun);
  return {
    success: true,
    data: dataPembayaran,
  };
};

export const pengajuanPembayaran = async (
  data: NominatifPembayaranWithoutFile
): Promise<ActionResponse<Pembayaran>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const penggunaId = pengguna.data.penggunaId;
  const satkerId = pengguna.data.satkerId;
  const status = "RequestToPay";
  const tahun = await getTahunAnggranPilihan();

  // check if the data is for jadwal or kegiatan
  const kegiatan = await dbHonorarium.kegiatan.findFirst({
    where: {
      id: data.kegiatanId,
      satkerId,
    },
  });

  if (!kegiatan) {
    return {
      success: false,
      error: "Kegiatan not found",
      message: "Kegiatan not found",
    };
  }

  let mappedId = "";
  let mapTo = "kegiatan";
  // bisa jadi nanti ada honorarium lain misal kepanitiaan
  if (data.jenisPengajuan === "HONORARIUM" && data.jadwalId) {
    mappedId = data.jadwalId;
    mapTo = "jadwal";
  } else {
    mappedId = data.kegiatanId;
  }
  try {
    const transaction = await dbHonorarium.$transaction(async (prisma) => {
      let updateRiwayatPengajuan: RiwayatPengajuan;
      let riwayatPengajuanId: string | undefined;
      switch (mapTo) {
        case "jadwal":
          const jadwal = await prisma.jadwal.findUnique({
            where: {
              id: mappedId,
            },
          });

          // jadwal sudah harus pernah diajukan dan disetujui
          if (!jadwal || !jadwal.riwayatPengajuanId) {
            return null;
          }

          riwayatPengajuanId = jadwal.riwayatPengajuanId;

          // // jika pengajuan honorarium, update status pengajuan honorarium
          // updateRiwayatPengajuan = await prisma.riwayatPengajuan.update({
          //   where: {
          //     id: jadwal.riwayatPengajuanId,
          //     status: "APPROVED",
          //   },
          //   data: {
          //     status: "REQUEST_TO_PAY",
          //     dimintaPembayaranOlehId: penggunaId,
          //     dimintaPembayaranTanggal: new Date(),
          //   },
          // });
          break;
        case "kegiatan":
          const jenisPengajuan = getJenisPengajuan(data.jenisPengajuan);
          if (!jenisPengajuan) {
            return null;
          }
          const riwayat =
            await getRiwayatPengajuanByKegiatanIdAndJenisPengajuan(
              mappedId,
              data.jenisPengajuan as JENIS_PENGAJUAN
            );

          if (!riwayat) {
            return null;
          }

          riwayatPengajuanId = riwayat.id;

          // updateRiwayatPengajuan = await prisma.riwayatPengajuan.update({
          //   where: {
          //     id: riwayat?.id,
          //   },
          //   data: {
          //     status: "REQUEST_TO_PAY",
          //     dimintaPembayaranOlehId: penggunaId,
          //     dimintaPembayaranTanggal: new Date(),
          //   },
          // });
          break;

        default:
          break;
      }
      const pembayaran = await dbHonorarium.pembayaran.create({
        data: {
          kegiatanId: data.kegiatanId,
          mapTo,
          satkerId: satkerId,
          mappedId: mappedId,
          jenisPengajuan: data.jenisPengajuan as JENIS_PENGAJUAN,
          bendaharaId: data.bendaharaId,
          ppkId: data.ppkId,
          dokumenBuktiPajak: data.buktiPajakCuid,
          catatan: data.catatan,
          status: "RequestToPay",
          createdBy: penggunaId,
        },
      });
      return pembayaran;
    });

    if (!transaction) {
      return {
        success: false,
        error: "Tidak dapat menemukan data yang sesuai",
        message: "Tidak dapat menemukan data yang sesuai",
      };
    }

    revalidatePath("/daftar-nominatif");
    return {
      success: true,
      data: transaction,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented yet",
      message: "Not implemented yet",
    };
  }
};
