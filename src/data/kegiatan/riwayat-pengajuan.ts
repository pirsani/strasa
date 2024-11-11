"use server";
import { PenggunaInfo } from "@/data/pengguna";
import { dbHonorarium } from "@/lib/db-honorarium";
import {
  JENIS_PENGAJUAN,
  Kegiatan,
  RiwayatPengajuan,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";

export interface ObjRiwayatPengajuanUpdate {
  status: STATUS_PENGAJUAN;
  diverifikasiOlehId?: string;
  disetujuiOlehId?: string;
  dimintaPembayaranOlehId?: string;
  dibayarOlehId?: string;
  diselesaikanOlehId?: string;
  catatanRevisi?: string;
  catatanPermintaaPembayaran?: string;

  diverifikasiTanggal?: Date;
  disetujuiTanggal?: Date;
  dimintaPembayaranTanggal?: Date;
  dibayarTanggal?: Date;
  diselesaikanTanggal?: Date;

  ppkId?: string;
  bendaharaId?: string;

  dokumenBuktiPajak?: string;
  dokumenBuktiPembayaran?: string;
}

export interface ObjCreateRiwayatPengajuan {
  jenis: JENIS_PENGAJUAN;
  status: STATUS_PENGAJUAN;
  diajukanOlehId: string;
  diajukanTanggal: Date;
}

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

export interface StatusCount {
  status: STATUS_PENGAJUAN;
  count: number;
}

export const getDistinctStatusPengajuan = async (
  tahunAnggaran: number
): Promise<StatusCount[] | null> => {
  try {
    const result = await dbHonorarium.$queryRaw<StatusCount[]>`
      SELECT status, COUNT(*) as count
      FROM riwayat_pengajuan
      WHERE EXTRACT(YEAR FROM diajukan_tanggal) = ${tahunAnggaran}
      GROUP BY status
    `;
    return result.length ? result : null;
  } catch (error) {
    console.error("Error fetching distinct status pengajuan:", error);
    return null;
  }
};
