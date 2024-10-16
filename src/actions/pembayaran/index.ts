"use server";

import { getSessionPenggunaForAction } from "@/actions/pengguna";
import {
  getObjPlainPembayaran,
  ObjPlainPembayaranIncludeKegiatan,
} from "@/data/pembayaran";
import { dbHonorarium } from "@/lib/db-honorarium";
import { NominatifPembayaranWithoutFile } from "@/zod/schemas/nominatif-pembayaran";
import { JENIS_PENGAJUAN, Pembayaran } from "@prisma-honorarium/client";
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
// const getDataPengajuanPembayaran = async () => {
//   const pengguna = await getSessionPenggunaForAction();
//   if (!pengguna.success) {
//     return pengguna;
//   }

//   const satkerId = pengguna.data.satkerId;
//   const status = "RequestToPay";
//   const tahun = await getTahunAnggranPilihan();
//   const kegiatanDalamNegeri = await getObjPlainKegiatanWithStatus(
//     satkerId,
//     status,
//     tahun
//   );

//   const jadwalKelasNarasumber = await getObPlainJadwalBySatkerIdWithStatus(
//     satkerId,
//     status,
//     tahun
//   );
// };

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
      switch (mapTo) {
        case "jadwal":
          // jika pengajuan honorarium, update status pengajuan honorarium
          const updateJadwal = await prisma.jadwal.update({
            where: {
              id: mappedId,
            },
            data: {
              statusPengajuanHonorarium: "RequestToPay",
            },
          });
          break;
        case "kegiatan":
          // jika pengajuan kegiatan, update status pengajuan kegiatan
          let dataStatus: {
            statusUhDalamNegeri?: string;
            statusUhLuarNegeri?: string;
          } = {};
          if (kegiatan.lokasi !== "LUAR_NEGERI") {
            dataStatus = {
              statusUhDalamNegeri: "RequestToPay",
            };
          } else {
            dataStatus = {
              statusUhLuarNegeri: "RequestToPay",
            };
          }
          const updateKegiatan = await prisma.kegiatan.update({
            where: {
              id: mappedId,
            },
            data: {
              ...dataStatus,
              updatedAt: new Date(),
              updatedBy: penggunaId,
            },
          });
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
