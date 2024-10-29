import { dbHonorarium } from "@/lib/db-honorarium";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import {
  DokumenKegiatan,
  Itinerary,
  Jadwal,
  Kegiatan,
  Organisasi,
  PejabatPerbendaharaan,
  PesertaKegiatan,
  Provinsi,
  RiwayatPengajuan,
  Spd,
  UhDalamNegeri,
  UhLuarNegeri,
} from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export interface KegiatanIncludeSatker extends Kegiatan {
  satker: Organisasi;
  unitKerja: Organisasi;
  ppk?: PejabatPerbendaharaan | null;
  bendahara?: PejabatPerbendaharaan | null;
  spd?: Spd | null;
}

export interface JadwalIncludeKegiatan extends Jadwal {
  kegiatan: KegiatanIncludeSatker;
}

export const getKegiatanById = async (
  kegiatanId: string
): Promise<KegiatanIncludeSatker | null> => {
  const kegiatan = await dbHonorarium.kegiatan.findUnique({
    where: {
      id: kegiatanId,
    },
    include: {
      satker: true,
      unitKerja: true,
      ppk: true,
      bendahara: true,
      spd: true,
    },
  });
  return kegiatan;
};

export interface KegiatanIncludeSpd extends Kegiatan {
  satker: Organisasi;
  unitKerja: Organisasi;
  ppk?: PejabatPerbendaharaan | null;
  bendahara?: PejabatPerbendaharaan | null;
  spd?: Spd | null;
  provinsi?: Provinsi | null;
  pesertaKegiatan?: PesertaKegiatan[] | null;
  itinerary?: Itinerary[] | null;
}
export const getKegiatanIncludeSpd = async (
  kegiatanId: string
): Promise<KegiatanIncludeSpd | null> => {
  const kegiatan = await dbHonorarium.kegiatan.findUnique({
    where: {
      id: kegiatanId,
    },
    include: {
      satker: true,
      unitKerja: true,
      ppk: true,
      spd: true,
      provinsi: true,
      pesertaKegiatan: true,
      itinerary: true,
    },
  });
  return kegiatan;
};

type ObjPlainUhLuarNegeri = Omit<
  UhLuarNegeri,
  "uhPerjalanan" | "uhUangHarian" | "uhDiklat"
> & {
  uhPerjalanan: number | Decimal | null;
  uhUangHarian: number | Decimal | null;
  uhDiklat: number | Decimal | null;
};

export interface PesertaKegiatanIncludeUh extends PesertaKegiatan {
  uhDalamNegeri?: UhDalamNegeri | null;
  uhLuarNegeri?: ObjPlainUhLuarNegeri[] | null;
}

export interface KegiatanIncludeAllDetail extends Kegiatan {
  itinerary: Itinerary[] | null;
  provinsi: Provinsi | null;
  dokumenKegiatan: DokumenKegiatan[] | null;
  riwayatPengajuan?: RiwayatPengajuan[] | null;
  spd?: Spd | null;
  pesertaKegiatan?: PesertaKegiatanIncludeUh[] | null;
}

export const getKegiatanWithAllDetailById = async (
  id: string
): Promise<KegiatanIncludeAllDetail | null> => {
  const kegiatan = await dbHonorarium.kegiatan.findUnique({
    where: { id },
    include: {
      itinerary: true,
      provinsi: true,
      dokumenKegiatan: {
        orderBy: {
          createdAt: "desc",
        },
      },
      riwayatPengajuan: true,
      spd: true,
      pesertaKegiatan: {
        include: {
          uhDalamNegeri: true,
          uhLuarNegeri: true,
        },
      },
    },
  });

  const ObjPlain =
    convertSpecialTypesToPlain<KegiatanIncludeAllDetail>(kegiatan);

  console.log(kegiatan);
  return ObjPlain;
};
