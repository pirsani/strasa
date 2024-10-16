"use server";

import { dbHonorarium } from "@/lib/db-honorarium";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import {
  Kegiatan,
  Organisasi,
  PejabatPerbendaharaan,
  Pembayaran,
} from "@prisma-honorarium/client";

interface PembayaranIncludeKegiatan extends Pembayaran {
  kegiatan: Kegiatan;
  satker: Organisasi;
  bendahara: PejabatPerbendaharaan;
  ppk: PejabatPerbendaharaan;
}
export const getDataPembayaran = async (
  satkerId: string,
  tahun: number = new Date().getFullYear(),
  status?: string
): Promise<PembayaranIncludeKegiatan[] | null> => {
  const pembayaran = await dbHonorarium.pembayaran.findMany({
    where: {
      kegiatan: {
        satkerId: satkerId,
        tanggalMulai: {
          gte: new Date(tahun, 0, 1),
          lt: new Date(tahun + 1, 0, 1),
        },
      },
      ...(status && { status: status }), // Conditionally add status filter
    },
    include: {
      satker: true,
      kegiatan: true,
      bendahara: true,
      ppk: true,
    },
  });
  return pembayaran;
};

export type ObjPlainPembayaranIncludeKegiatan = Omit<
  PembayaranIncludeKegiatan,
  "tanggalPembayaran" | "createdAt" | "updatedAt"
> & {
  tanggalPembayaran: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export const getObjPlainPembayaran = async (
  satkerId: string,
  tahun: number = new Date().getFullYear(),
  status?: string
): Promise<ObjPlainPembayaranIncludeKegiatan[]> => {
  const pembayaran = await getDataPembayaran(satkerId, tahun, status);
  const plainObject =
    convertSpecialTypesToPlain<ObjPlainPembayaranIncludeKegiatan[]>(pembayaran);
  return plainObject;
};
