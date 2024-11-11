"use server";

import { STATUS_PENGAJUAN } from "@/lib/constants";
import { dbHonorarium } from "@/lib/db-honorarium";
import { KegiatanWithSatker } from "./index";

export const getKegiatanHasStatusPengajuan = async (
  status: STATUS_PENGAJUAN
): Promise<KegiatanWithSatker[]> => {
  const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findMany({
    where: {
      status: status,
    },
    include: {
      kegiatan: {
        include: {
          satker: true,
          unitKerja: true,
        },
      },
    },
  });
  // filter unique kegiatan
  const kegiatan = riwayatPengajuan.map((item) => item.kegiatan);
  const kegiatanUnique = kegiatan.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );
  return kegiatanUnique;

  //return riwayatPengajuan.map((item) => item.kegiatan);
};
