"use server";
import { PenggunaInfo } from "@/data/pengguna";
import { dbHonorarium } from "@/lib/db-honorarium";
import {
  DokumenKegiatan,
  Itinerary,
  Jadwal,
  JENIS_PENGAJUAN,
  Kegiatan,
  Kelas,
  Materi,
  Organisasi,
  Provinsi,
  RiwayatPengajuan,
  Spd,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";

export interface ObjRiwayatPengajuanUpdate {
  mak?: string;
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
  inputBuktiBayarTanggal?: Date;
  diselesaikanTanggal?: Date;

  ppkId?: string;
  bendaharaId?: string;

  dokumenBuktiPajak?: string;
  dokumenBuktiPembayaran?: string;
  dokumentasi?: string | null;
  dokumenLaporanKegiatan?: string | null;
  dokumenLainnya?: string | null;
}

export interface ObjCreateRiwayatPengajuan {
  jenis: JENIS_PENGAJUAN;
  status: STATUS_PENGAJUAN;
  diajukanOlehId: string;
  diajukanTanggal: Date;
}

export interface KegiatanIncludeSatker extends Kegiatan {
  satker: Organisasi;
  unitKerja: Organisasi;
  itinerary?: Itinerary[] | null;
  provinsi?: Provinsi | null;
  dokumenKegiatan?: DokumenKegiatan[] | null;
  spd?: Spd | null;
}

export interface JadwalIncludeKelasMateri extends Jadwal {
  kelas: Kelas;
  materi: Materi;
}

export type RiwayatPengajuanPlain = Omit<
  RiwayatPengajuan,
  "createdAt|updatedAt"
> & {
  createdAt: Date | string;
  updatedAt: Date | string | null;
};

export interface RiwayatPengajuanIncludePengguna extends RiwayatPengajuanPlain {
  keterangan?: string;
  kegiatan?: KegiatanIncludeSatker;
  jadwal?: JadwalIncludeKelasMateri;
  diajukanOleh: PenggunaInfo;
  diverifikasiOleh?: PenggunaInfo | null;
  disetujuiOleh?: PenggunaInfo | null;
  dimintaPembayaranOleh?: PenggunaInfo | null;
  dibayarOleh?: PenggunaInfo | null;
  diselesaikanOleh?: PenggunaInfo | null;
}

export interface JadwalIncludeRiwayatKegiatan extends Jadwal {
  kelas: Kelas;
  materi: Materi;
  riwayatPengajuan?: RiwayatPengajuanIncludePengguna | null;
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
      kegiatan: {
        include: {
          satker: true,
          unitKerja: true,
        },
      },
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
      kegiatan: {
        include: {
          satker: true,
          unitKerja: true,
        },
      },
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

export const getRiwayatPengajuanRampunganByKegiatanId = async (
  kegiatanId: string
) => {
  const riwayat = await dbHonorarium.riwayatPengajuan.findFirst({
    where: {
      kegiatanId,
      jenis: "GENERATE_RAMPUNGAN",
    },
    orderBy: {
      createdAt: "desc",
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
      kegiatan: {
        include: {
          satker: true,
          unitKerja: true,
        },
      },
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
      kegiatan: {
        include: {
          satker: true,
          unitKerja: true,
        },
      },
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
  tahunAnggaran: number,
  satkerId?: string
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

export const getCountStatusPengajuan = async (
  tahunAnggaran: number,
  satkerId?: string,
  unitKerjaId?: string
): Promise<StatusCount[] | null> => {
  const result = await dbHonorarium.riwayatPengajuan.groupBy({
    by: ["status"],
    where: {
      kegiatan: {
        tanggalMulai: {
          gte: new Date(`${tahunAnggaran}-01-01`),
          lte: new Date(`${tahunAnggaran}-12-31`),
        },
        ...(satkerId && { satkerId }),
        ...(unitKerjaId && { unitKerjaId }),
      },
    },
    _count: {
      status: true,
    },
  });

  const formattedResult = result.map((item) => ({
    status: item.status,
    count: item._count.status,
  }));
  return formattedResult.length ? formattedResult : null;
};

export const getDistinctInStatusPengajuan = async (
  tahunAnggaran: number,
  inStatus: STATUS_PENGAJUAN[]
): Promise<StatusCount[] | null> => {
  // Convert inStatus array to a format that can be used in the raw query
  const formattedInStatus = inStatus.map((status) => `'${status}'`).join(",");
  console.log(formattedInStatus);

  // https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries
  // https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries#dynamic-table-names-in-postgresql
  // https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing

  https: try {
    const query = `
    SELECT status, COUNT(*) as count
      FROM riwayat_pengajuan
      WHERE EXTRACT(YEAR FROM diajukan_tanggal) = ${tahunAnggaran}
      and status in (${formattedInStatus})
      GROUP BY status`;

    console.log(query);
    const result = await dbHonorarium.$queryRawUnsafe<StatusCount[]>(query); // hanya gunakan queryRawUnsafe jika terpaksa
    return result.length ? result : null;
  } catch (error) {
    console.error("Error fetching distinct status pengajuan:", error);
    return null;
  }
};

export const getRiwayatPengajuanInStatus = async (
  satkerId: string,
  statusPengajuan: STATUS_PENGAJUAN[],
  tahunAnggaran: number = new Date().getFullYear(),
  jenisPengajuan: JENIS_PENGAJUAN[] = [
    "HONORARIUM",
    "UH_DALAM_NEGERI",
    "UH_LUAR_NEGERI",
  ]
): Promise<RiwayatPengajuanIncludePengguna[] | null> => {
  try {
    const riwayat = await dbHonorarium.riwayatPengajuan.findMany({
      where: {
        status: {
          in: statusPengajuan,
        },
        jenis: {
          in: jenisPengajuan,
        },
        kegiatan: {
          satkerId,
          tanggalMulai: {
            gte: new Date(`${tahunAnggaran}-01-01`),
            lte: new Date(`${tahunAnggaran}-12-31`),
          },
        },
      },
      include: {
        kegiatan: {
          include: {
            satker: true,
            unitKerja: true,
          },
        },
        diajukanOleh: true,
        diverifikasiOleh: true,
        disetujuiOleh: true,
        dimintaPembayaranOleh: true,
        dibayarOleh: true,
        diselesaikanOleh: true,
      },
    });
    return riwayat;
  } catch (error) {
    console.error("Error fetching riwayat pengajuan by status:", error);
    return null;
  }
};

const getRiwayatPengajuanHonorarium = async (
  satkerId: string,
  statusPengajuan: STATUS_PENGAJUAN[],
  tahunAnggaran: number = new Date().getFullYear()
): Promise<JadwalIncludeRiwayatKegiatan[] | null> => {
  try {
    const jadwal = await dbHonorarium.jadwal.findMany({
      where: {
        kegiatan: {
          satkerId,
          tanggalMulai: {
            gte: new Date(`${tahunAnggaran}-01-01`),
            lte: new Date(`${tahunAnggaran}-12-31`),
          },
        },
        riwayatPengajuan: {
          status: {
            in: statusPengajuan,
          },
        },
      },
      include: {
        riwayatPengajuan: {
          include: {
            kegiatan: {
              include: {
                satker: true,
                unitKerja: true,
              },
            },
            diajukanOleh: true,
            diverifikasiOleh: true,
            disetujuiOleh: true,
            dimintaPembayaranOleh: true,
            dibayarOleh: true,
            diselesaikanOleh: true,
          },
        },
        kelas: true,
        materi: true,
      },
    });
    return jadwal;
  } catch (error) {
    console.error("Error fetching riwayat pengajuan by status:", error);
    return null;
  }
};

export const getRiwayatPengajuanUntukDokumenAkhir = async (
  satkerId: string,
  tahunAnggaran: number = new Date().getFullYear()
): Promise<RiwayatPengajuanIncludePengguna[] | null> => {
  try {
    let riwayat: RiwayatPengajuanIncludePengguna[] = [];

    const inStatus: STATUS_PENGAJUAN[] = [
      STATUS_PENGAJUAN.PAID,
      // STATUS_PENGAJUAN.END,
    ];
    const jadwals = await getRiwayatPengajuanHonorarium(
      satkerId,
      inStatus,
      tahunAnggaran
    );

    const rph = jadwals?.map((jadwal) => {
      if (!jadwal.riwayatPengajuan || !jadwal.riwayatPengajuan.kegiatan)
        return null;
      const rwy = {
        ...jadwal.riwayatPengajuan,
        jadwal,
        keterangan: `${jadwal.kelas.nama} - ${jadwal.materi.nama}`,
      };
      return rwy;
    });

    //filter out null value
    const riwayatPengajuanHonorarium =
      rph?.filter((item) => item !== null) || [];

    riwayat = [...riwayatPengajuanHonorarium];

    const riwayatPengajuanUh = await getRiwayatPengajuanInStatus(
      satkerId,
      inStatus,
      tahunAnggaran,
      ["UH_DALAM_NEGERI", "UH_LUAR_NEGERI"]
    );

    if (riwayatPengajuanUh) {
      riwayat = [...riwayat, ...riwayatPengajuanUh];
    }

    return riwayat;
    // merge the data
  } catch (error) {
    console.error("Error fetching riwayat pengajuan by status:", error);
    return null;
  }
};
