"use server";
import { PenggunaInfo } from "@/data/pengguna";
import { dbHonorarium } from "@/lib/db-honorarium";
import { JENIS_PENGAJUAN, RiwayatPengajuan } from "@prisma-honorarium/client";

export interface RiwayatPengajuanIncludePengguna extends RiwayatPengajuan {
  diajukanOleh: PenggunaInfo;
  diverifikasiOleh?: PenggunaInfo | null;
  disetujuiOleh?: PenggunaInfo | null;
  dimintaPembayaranOleh?: PenggunaInfo | null;
  dibayarOleh?: PenggunaInfo | null;
  diselesaikanOleh?: PenggunaInfo | null;
}

export const getRiwayatPengajuanByKegiatanId = async (
  kegiatanId: string
): Promise<RiwayatPengajuanIncludePengguna[] | null> => {
  const riwayat = await dbHonorarium.riwayatPengajuan.findMany({
    where: {
      kegiatanId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      diajukanOleh: true,
      diverifikasiOleh: true,
      disetujuiOleh: true,
      dimintaPembayaranOleh: true,
      dibayarOleh: true,
      diselesaikanOleh: true,
    },
  });
  return riwayat;
};

// it should be only return 1 data
export const getRiwayatPengajuanByKegiatanIdAndJenisPengajuan = async (
  kegiatanId: string,
  jenis: JENIS_PENGAJUAN
): Promise<RiwayatPengajuanIncludePengguna | null> => {
  const riwayat = await dbHonorarium.riwayatPengajuan.findFirst({
    where: {
      kegiatanId,
      jenis,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      diajukanOleh: true,
      diverifikasiOleh: true,
      disetujuiOleh: true,
      dimintaPembayaranOleh: true,
      dibayarOleh: true,
      diselesaikanOleh: true,
    },
  });
  return riwayat;
};

export const getRiwayatPengajuanByKegiatanIdAndJenisPengajuanIn = async (
  kegiatanId: string,
  jenis: JENIS_PENGAJUAN[]
): Promise<RiwayatPengajuanIncludePengguna[] | null> => {
  const riwayat = await dbHonorarium.riwayatPengajuan.findMany({
    where: {
      kegiatanId,
      jenis: {
        in: jenis,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      diajukanOleh: true,
      diverifikasiOleh: true,
      disetujuiOleh: true,
      dimintaPembayaranOleh: true,
      dibayarOleh: true,
      diselesaikanOleh: true,
    },
  });
  return riwayat;
};
