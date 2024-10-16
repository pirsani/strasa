"use server";

import { dbHonorarium } from "@/lib/db-honorarium";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import { Kegiatan, Organisasi } from "@prisma-honorarium/client";

export interface KegiatanIncludeSatker extends Kegiatan {
  satker: Organisasi;
  unitKerja: Organisasi;
}

export const getKegiatanWithStatus = (
  satkerId: string,
  statusPengajuan: string,
  tahun: number = new Date().getFullYear()
) => {
  const kegiatan = dbHonorarium.kegiatan.findMany({
    where: {
      tanggalMulai: {
        gte: new Date(tahun, 0, 1),
        lt: new Date(tahun + 1, 0, 1),
      },
      statusUhDalamNegeri: statusPengajuan,
      satkerId: satkerId,
    },
    include: {
      satker: true,
      unitKerja: true,
    },
  });
  return kegiatan;
};

export type ObjPlainKegiatanIncludeSatker = Omit<
  KegiatanIncludeSatker,
  "tanggalMulai" | "tanggalSelesai" | "createdAt" | "updatedAt"
> & {
  tanggalMulai: Date | string;
  tanggalSelesai: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export const getObjPlainKegiatanWithStatus = async (
  satkerId: string,
  statusPengajuan: string,
  tahun: number = new Date().getFullYear()
) => {
  const kegiatan = await getKegiatanWithStatus(
    satkerId,
    statusPengajuan,
    tahun
  );
  const plainObject =
    convertSpecialTypesToPlain<ObjPlainKegiatanIncludeSatker>(kegiatan);
  return plainObject;
};
