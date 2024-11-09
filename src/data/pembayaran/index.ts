"use server";

import { KegiatanIncludeSatker } from "@/data/kegiatan/";
import { ObjPlainRiwayatPengajuan } from "@/data/kegiatan/riwayat-pengajuan";
import { dbHonorarium } from "@/lib/db-honorarium";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import {
  Jadwal,
  Kegiatan,
  Kelas,
  Materi,
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

export interface RiwayatPengajuanIncludeKegiatan
  extends ObjPlainRiwayatPengajuan {
  kegiatan: KegiatanIncludeSatker;
  keterangan?: string;
}

// TODO
// harus dikonfirmasi lagi apakah ppk dan bendahara ditentukan di kegiatan atau di setiap pengajuan bisa berbeda

export const getPengajuanPembayaran = async (
  satkerId: string,
  tahun: number = new Date().getFullYear()
) => {
  const pengajuan = await dbHonorarium.riwayatPengajuan.findMany({
    where: {
      status: {
        in: ["REQUEST_TO_PAY", "PAID"],
      },
      kegiatan: {
        satkerId: satkerId,
        tanggalMulai: {
          gte: new Date(tahun, 0, 1),
          lt: new Date(tahun + 1, 0, 1),
        },
      },
    },
    include: {
      kegiatan: {
        include: {
          satker: true,
          unitKerja: true,
          ppk: true,
          bendahara: true,
          spd: true,
        },
      },
      bendahara: true,
      ppk: true,
    },
  });
  return pengajuan;
};

export const getPengajuanPembayaranSelainHonorarium = async (
  satkerId: string,
  tahun: number = new Date().getFullYear()
) => {
  const pengajuan = await dbHonorarium.riwayatPengajuan.findMany({
    where: {
      status: {
        in: ["REQUEST_TO_PAY", "PAID"],
      },
      jenis: {
        not: "HONORARIUM",
      },
      kegiatan: {
        satkerId: satkerId,
        tanggalMulai: {
          gte: new Date(tahun, 0, 1),
          lt: new Date(tahun + 1, 0, 1),
        },
      },
    },
    include: {
      kegiatan: {
        include: {
          satker: true,
          unitKerja: true,
          ppk: true,
          bendahara: true,
          spd: true,
        },
      },
      bendahara: true,
      ppk: true,
    },
  });
  return pengajuan;
};

interface JadwalIncludeRiwayatPengajuan extends Jadwal {
  riwayatPengajuan: RiwayatPengajuanIncludeKegiatan | null;
  kelas: Kelas;
  materi: Materi;
}
export const getPengajuanPembayaranHonorarium = async (
  satkerId: string,
  tahun: number = new Date().getFullYear()
) => {
  const jadwal: JadwalIncludeRiwayatPengajuan[] =
    await dbHonorarium.jadwal.findMany({
      where: {
        kegiatan: {
          satkerId: satkerId,
          tanggalMulai: {
            gte: new Date(tahun, 0, 1),
            lt: new Date(tahun + 1, 0, 1),
          },
        },
      },
      include: {
        kelas: true,
        materi: true,
        riwayatPengajuan: {
          where: {
            status: {
              in: ["REQUEST_TO_PAY", "PAID"],
            },
          },
          include: {
            kegiatan: {
              include: {
                satker: true,
                unitKerja: true,
                ppk: true,
                bendahara: true,
                spd: true,
              },
            },
            bendahara: true,
            ppk: true,
          },
        },
      },
    });

  //const pengajuan = jadwal.flatMap((jadwal) => jadwal.riwayatPengajuan);
  const pengajuan = jadwal
    .filter(
      (jadwal) =>
        jadwal.riwayatPengajuan !== null &&
        jadwal.riwayatPengajuan !== undefined
    )
    .map((jadwal) => ({
      ...jadwal.riwayatPengajuan,
      keterangan: jadwal.kelas.nama + "-" + jadwal.materi.nama,
    }))
    .filter(Boolean);

  return pengajuan;
};

export const getObjPlainPengajuanPembayaran = async (
  satkerId: string,
  tahun: number = new Date().getFullYear()
): Promise<RiwayatPengajuanIncludeKegiatan[]> => {
  const pengajuanSelainHonorarium =
    await getPengajuanPembayaranSelainHonorarium(satkerId, tahun);
  const pengajuanHonorarium = await getPengajuanPembayaranHonorarium(
    satkerId,
    tahun
  );
  const pengajuan = [...pengajuanSelainHonorarium, ...pengajuanHonorarium];
  const plainObject =
    convertSpecialTypesToPlain<RiwayatPengajuanIncludeKegiatan[]>(pengajuan);
  return plainObject;
};
