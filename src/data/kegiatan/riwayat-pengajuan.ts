"use server";
import { PenggunaInfo } from "@/data/pengguna";
import { dbHonorarium } from "@/lib/db-honorarium";
import {
  JENIS_PENGAJUAN,
  Kegiatan,
  RiwayatPengajuan,
} from "@prisma-honorarium/client";

export interface RiwayatPengajuanIncludePengguna extends RiwayatPengajuan {
  kegiatan?: Kegiatan;
  diajukanOleh: PenggunaInfo;
  diverifikasiOleh?: PenggunaInfo | null;
  disetujuiOleh?: PenggunaInfo | null;
  dimintaPembayaranOleh?: PenggunaInfo | null;
  dibayarOleh?: PenggunaInfo | null;
  diselesaikanOleh?: PenggunaInfo | null;
}

export type ObjPlainRiwayatPengajuan = Omit<
  RiwayatPengajuan,
  | "createdAt"
  | "updatedAt"
  | "diajukanTanggal"
  | "diverifikasiTanggal"
  | "disetujuiTanggal"
  | "dimintaPembayaranTanggal"
  | "dibayarTanggal"
  | "diselesaikanTanggal"
> & {
  createdAt: Date | string;
  updatedAt: Date | string | null;
  diajukanTanggal: Date | string;
  diverifikasiTanggal: Date | string | null;
  disetujuiTanggal: Date | string | null;
  dimintaPembayaranTanggal: Date | string | null;
  dibayarTanggal: Date | string | null;
  diselesaikanTanggal: Date | string | null;
};

export const getRiwayatPengajuanById = async (
  riwayatPengajuanId: string
): Promise<RiwayatPengajuanIncludePengguna | null> => {
  const riwayat = await dbHonorarium.riwayatPengajuan.findUnique({
    where: {
      id: riwayatPengajuanId,
    },
    include: {
      kegiatan: true,
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
