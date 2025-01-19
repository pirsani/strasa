"use server";
import { RiwayatPengajuanIncludePengguna } from "@/data/kegiatan/riwayat-pengajuan";
import { dbHonorarium } from "@/lib/db-honorarium";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import {
  Jadwal,
  JadwalNarasumber,
  Kegiatan,
  Kelas,
  Materi,
  Narasumber,
  SbmHonorarium,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export type JadwalPlainObject = Omit<
  Jadwal,
  | "tanggal"
  | "createdAt"
  | "updatedAt"
  | "diajukanTanggal"
  | "diverifikasiTanggal"
  | "disetujuiTanggal"
  | "dibayarTanggal"
  | "jumlahJamPelajaran"
> & {
  tanggal: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  diajukanTanggal: Date | string | null;
  diverifikasiTanggal: Date | string | null;
  disetujuiTanggal: Date | string | null;
  dibayarTanggal: Date | string | null;
  jumlahJamPelajaran: Decimal | number | null;
};

export interface JadwalNarsum extends JadwalNarasumber {
  narasumber: Narasumber;
  jenisHonorarium?: SbmHonorarium | null;
}

export interface Narsum extends Narasumber {}

export interface ObjPlainJadwalKelasNarasumber extends JadwalPlainObject {
  kelas: Kelas;
  materi: Materi;
  jadwalNarasumber: JadwalNarsum[];
  kegiatan?: Kegiatan;
  riwayatPengajuan?: RiwayatPengajuanIncludePengguna | null;
  // diajukanOleh?: PenggunaInfo | null;
  // disetujuiOleh?: PenggunaInfo | null;
}

export interface JadwalKelasNarasumber extends Jadwal {
  kelas: Kelas;
  materi: Materi;
  jadwalNarasumber: JadwalNarsum[];
  kegiatan?: Kegiatan;
  riwayatPengajuan?: RiwayatPengajuanIncludePengguna | null;
  // diajukanOleh?: PenggunaInfo | null;
  // disetujuiOleh?: PenggunaInfo | null;
}
export const getJadwalByKegiatanId = async (
  kegiatanId: string
): Promise<JadwalKelasNarasumber[]> => {
  const jadwal = await dbHonorarium.jadwal.findMany({
    where: {
      kegiatanId: kegiatanId,
    },
    include: {
      kelas: true,
      materi: true,
      jadwalNarasumber: {
        include: {
          narasumber: true,
        },
      },
      riwayatPengajuan: {
        include: {
          diajukanOleh: true,
          diverifikasiOleh: true,
          disetujuiOleh: true,
          dimintaPembayaranOleh: true,
          dibayarOleh: true,
          diselesaikanOleh: true,
        },
      },
    },
  });
  console.log(["[kegiatanId]"], kegiatanId);
  console.log(["[JadwalKelasNarasumber]"], jadwal);

  return jadwal;
};

export const getJadwalByKegiatanIdWithStatus = async (
  kegiatanId: string,
  statusPengajuanHonorarium: STATUS_PENGAJUAN
): Promise<JadwalKelasNarasumber[]> => {
  const jadwal = await dbHonorarium.jadwal.findMany({
    where: {
      kegiatanId: kegiatanId,
      riwayatPengajuan: {
        status: statusPengajuanHonorarium,
      },
    },
    include: {
      kelas: true,
      materi: true,
      jadwalNarasumber: {
        include: {
          narasumber: true,
        },
      },
      riwayatPengajuan: {
        include: {
          diajukanOleh: true,
          diverifikasiOleh: true,
          disetujuiOleh: true,
          dimintaPembayaranOleh: true,
          dibayarOleh: true,
          diselesaikanOleh: true,
        },
      },
    },
  });
  return jadwal;
};

export const getJadwalBySatkerIdWithStatus = async (
  satkerId: string,
  statusPengajuanHonorarium: STATUS_PENGAJUAN,
  tahun: number = new Date().getFullYear()
): Promise<JadwalKelasNarasumber[]> => {
  const jadwal = await dbHonorarium.jadwal.findMany({
    where: {
      kegiatan: {
        satkerId: satkerId,
        tanggalMulai: {
          gte: new Date(tahun, 0, 1),
          lt: new Date(tahun + 1, 0, 1),
        },
      },
      riwayatPengajuan: {
        status: statusPengajuanHonorarium,
      },
    },
    include: {
      kelas: true,
      materi: true,
      jadwalNarasumber: {
        include: {
          narasumber: true,
        },
      },
      riwayatPengajuan: {
        include: {
          diajukanOleh: true,
          diverifikasiOleh: true,
          disetujuiOleh: true,
          dimintaPembayaranOleh: true,
          dibayarOleh: true,
          diselesaikanOleh: true,
        },
      },
    },
  });

  return jadwal;
};

export const getObPlainJadwalByKegiatanId = async (kegiatanId: string) => {
  const jadwal = await getJadwalByKegiatanId(kegiatanId);
  const plainObject =
    convertSpecialTypesToPlain<ObjPlainJadwalKelasNarasumber[]>(jadwal);
  return plainObject;
};

export const getObPlainJadwalByKegiatanIdWithStatusDisetujui = async (
  kegiatanId: string
) => {
  const jadwal = await getJadwalByKegiatanIdWithStatus(kegiatanId, "APPROVED");
  const plainObject =
    convertSpecialTypesToPlain<ObjPlainJadwalKelasNarasumber[]>(jadwal);
  return plainObject;
};

export const getObPlainJadwalBySatkerIdWithStatus = async (
  satkerId: string,
  status: STATUS_PENGAJUAN,
  tahun: number = new Date().getFullYear()
) => {
  const jadwal = await getJadwalBySatkerIdWithStatus(satkerId, status, tahun);
  const plainObject =
    convertSpecialTypesToPlain<ObjPlainJadwalKelasNarasumber[]>(jadwal);
  return plainObject;
};

export const getObPlainJadwalBySatkerIdWithStatusPermintanPembayaran = async (
  satkerId: string
) => {
  const jadwal = await getJadwalBySatkerIdWithStatus(
    satkerId,
    "REQUEST_TO_PAY"
  );
  const plainObject =
    convertSpecialTypesToPlain<ObjPlainJadwalKelasNarasumber[]>(jadwal);
  return plainObject;
};

export const getObjPlainJadwalById = async (
  jadwalId: string
): Promise<ObjPlainJadwalKelasNarasumber> => {
  const jadwal = await getJadwalById(jadwalId);
  const plainObject =
    convertSpecialTypesToPlain<ObjPlainJadwalKelasNarasumber>(jadwal);
  return plainObject;
};

export const getJadwalById = async (
  jadwalId: string
): Promise<JadwalKelasNarasumber | null> => {
  const jadwal = await dbHonorarium.jadwal.findFirst({
    where: {
      id: jadwalId,
    },
    include: {
      kegiatan: true,
      kelas: true,
      materi: true,
      riwayatPengajuan: {
        include: {
          diajukanOleh: true,
          diverifikasiOleh: true,
          disetujuiOleh: true,
          dimintaPembayaranOleh: true,
          dibayarOleh: true,
          diselesaikanOleh: true,
        },
      },
      jadwalNarasumber: {
        include: {
          narasumber: true,
          jenisHonorarium: true,
        },
      },
    },
  });
  return jadwal;
};

export const getJadwalByRiwayatPengajuanId = async (
  riwayatPengajuanId: string
): Promise<JadwalKelasNarasumber | null> => {
  const jadwal = await dbHonorarium.jadwal.findFirst({
    where: {
      riwayatPengajuanId: riwayatPengajuanId,
    },
    include: {
      kegiatan: true,
      kelas: true,
      materi: true,
      riwayatPengajuan: {
        include: {
          diajukanOleh: true,
          diverifikasiOleh: true,
          disetujuiOleh: true,
          dimintaPembayaranOleh: true,
          dibayarOleh: true,
          diselesaikanOleh: true,
        },
      },
      jadwalNarasumber: {
        include: {
          narasumber: true,
          jenisHonorarium: true,
        },
      },
    },
  });
  return jadwal;
};
