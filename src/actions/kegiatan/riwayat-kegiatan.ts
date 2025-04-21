"use server";

import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import { dbHonorarium } from "@/lib/db-honorarium";
import { KegiatanIncludeSatker } from "./index";

export const getKegiatanHasStatusPengajuan = async (
  status: STATUS_PENGAJUAN | null
): Promise<KegiatanIncludeSatker[]> => {
  const tahunAnggaran = await getTahunAnggranPilihan();
  const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findMany({
    where: {
      kegiatan: {
        tanggalMulai: {
          gte: new Date(`${tahunAnggaran}-01-01`),
          lte: new Date(`${tahunAnggaran}-12-31`),
        },
      },
      ...(status && { status }),
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

export const getCountStatusPengajuan = async (
  name: string
): Promise<number> => {
  // random number for testing
  const names = ["workbench", "pending"];
  if (!names.includes(name)) {
    return 0;
  }
  // TODO get count dari database
  const randomNumber = Math.floor(Math.random() * 100);
  return randomNumber;
};
