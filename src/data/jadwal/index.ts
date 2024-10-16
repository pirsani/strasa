"use server";
import { dbHonorarium } from "@/lib/db-honorarium";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import {
  Jadwal,
  JadwalNarasumber,
  Kegiatan,
  Kelas,
  Materi,
  Narasumber,
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
}

export interface Narsum extends Narasumber {}

export interface ObjPlainJadwalKelasNarasumber extends JadwalPlainObject {
  kelas: Kelas;
  materi: Materi;
  jadwalNarasumber: JadwalNarsum[];
}

export interface JadwalKelasNarasumber extends Jadwal {
  kelas: Kelas;
  materi: Materi;
  jadwalNarasumber: JadwalNarsum[];
  kegiatan?: Kegiatan;
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
    },
  });
  console.log(["[kegiatanId]"], kegiatanId);
  console.log(["[JadwalKelasNarasumber]"], jadwal);

  return jadwal;
};

export const getJadwalByKegiatanIdWithStatus = async (
  kegiatanId: string,
  statusPengajuanHonorarium: string
): Promise<JadwalKelasNarasumber[]> => {
  const jadwal = await dbHonorarium.jadwal.findMany({
    where: {
      kegiatanId: kegiatanId,
      statusPengajuanHonorarium: statusPengajuanHonorarium,
    },
    include: {
      kelas: true,
      materi: true,
      jadwalNarasumber: {
        include: {
          narasumber: true,
        },
      },
    },
  });
  console.log(["[kegiatanId]"], kegiatanId);
  console.log(["[JadwalKelasNarasumber]"], jadwal);

  return jadwal;
};

export const getJadwalBySatkerIdWithStatus = async (
  satkerId: string,
  statusPengajuanHonorarium: string,
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
      statusPengajuanHonorarium: statusPengajuanHonorarium,
    },
    include: {
      kelas: true,
      materi: true,
      jadwalNarasumber: {
        include: {
          narasumber: true,
        },
      },
      kegiatan: true,
    },
  });
  console.log(["[JadwalKelasNarasumber]"], jadwal);

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
  const jadwal = await getJadwalByKegiatanIdWithStatus(kegiatanId, "Approved");
  const plainObject =
    convertSpecialTypesToPlain<ObjPlainJadwalKelasNarasumber[]>(jadwal);
  return plainObject;
};

export const getObPlainJadwalBySatkerIdWithStatus = async (
  satkerId: string,
  status: string,
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
  const jadwal = await getJadwalBySatkerIdWithStatus(satkerId, "RequestToPay");
  const plainObject =
    convertSpecialTypesToPlain<ObjPlainJadwalKelasNarasumber[]>(jadwal);
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
      kelas: true,
      materi: true,
      jadwalNarasumber: {
        include: {
          narasumber: true,
        },
      },
    },
  });
  return jadwal;
};
