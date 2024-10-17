"use server";

import { ALUR_PROSES, STATUS_PENGAJUAN } from "@/lib/constants";
import { dbHonorarium } from "@/lib/db-honorarium";
import {
  DokumenKegiatan,
  Itinerary,
  Kegiatan,
  //ALUR_PROSES,
  Organisasi,
  Provinsi,
  RiwayatPengajuan,
} from "@prisma-honorarium/client";
import { Logger } from "tslog";
import { getTahunAnggranPilihan } from "../pengguna/preference";

const logger = new Logger({
  hideLogPositionForProduction: true,
  name: "KEGIATAN",
});

export interface KegiatanWithSatker extends Kegiatan {
  satker: Organisasi;
  unitKerja: Organisasi;
}

export const getKegiatan = async (
  kegiatan?: string
): Promise<KegiatanWithSatker[]> => {
  const dataKegiatan = await dbHonorarium.kegiatan.findMany({
    include: {
      satker: true,
      unitKerja: true,
    },
  });
  return dataKegiatan;
};

export interface KegiatanWithDetail extends Kegiatan {
  itinerary: Itinerary[] | null;
  provinsi: Provinsi | null;
  dokumenKegiatan: DokumenKegiatan[] | null;
  riwayatPengajuan?: RiwayatPengajuan[] | null;
}

export const getKegiatanById = async (
  id: string
): Promise<KegiatanWithDetail | null> => {
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
    },
  });

  console.log(kegiatan);
  return kegiatan;
};

export const getOptionsKegiatan = async () => {
  const tahunAnggaran = await getTahunAnggranPilihan();
  const dataKegiatan = await dbHonorarium.kegiatan.findMany({
    where: {
      tanggalMulai: {
        gte: new Date(`${tahunAnggaran}-01-01`),
        lte: new Date(`${tahunAnggaran}-12-31`),
      },
    },
  });
  // map dataKegiatan to options
  const optionsKegiatan = dataKegiatan.map((kegiatan) => ({
    value: kegiatan.id,
    // label: kegiatan.status + "-" + kegiatan.nama,
    label: kegiatan.nama,
  }));

  return optionsKegiatan;
};

export const getOptionsKegiatanOnAlurProses = async (proses: ALUR_PROSES) => {
  if (!proses) return [];
  let status: STATUS_PENGAJUAN = "DRAFT";

  switch (proses) {
    case "SETUP":
    case "PENGAJUAN":
      status = "DRAFT";
      break;
    case "VERIFIKASI":
      status = "SUBMITTED";
      break;
    case "NOMINATIF":
      status = "APPROVED";
      break;
    case "PEMBAYARAN":
      status = "REQUEST_TO_PAY";
      break;
    default:
      break;
  }

  logger.info("status", status);

  const kegiatans = await dbHonorarium.kegiatan.findMany({
    where: {
      riwayatPengajuan: {
        some: {
          status: status,
        },
      },
    },
  });
  const optionsKegiatan = kegiatans.map((kegiatan) => ({
    value: kegiatan.id,
    label: kegiatan.nama,
  }));
  return optionsKegiatan;
};
