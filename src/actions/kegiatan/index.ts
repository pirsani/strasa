"use server";

import { dbHonorarium } from "@/lib/db-honorarium";
import { Organisasi } from "@prisma-honorarium/client";

import { AlurProses } from "@/lib/constants";
import {
  DokumenKegiatan,
  Itinerary,
  Kegiatan,
  Provinsi,
} from "@prisma-honorarium/client";
import { getTahunAnggranPilihan } from "../pengguna/preference";

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

export const getOptionsKegiatanOnAlurProses = async (proses: AlurProses) => {
  if (!proses) return [];
  let statusUh = "";
  let statusHonorarium = "";
  switch (proses) {
    case "nominatif":
      statusUh = "Approved";
      statusHonorarium = "Submitted";
      break;
    default:
      break;
  }

  console.log("proses", proses);
  const tahunAnggaran = await getTahunAnggranPilihan();
  const dataKegiatan = await dbHonorarium.kegiatan.findMany({
    where: {
      tanggalMulai: {
        gte: new Date(`${tahunAnggaran}-01-01`),
        lte: new Date(`${tahunAnggaran}-12-31`),
      },
      OR: [
        { statusUhDalamNegeri: statusUh },
        { statusUhLuarNegeri: statusUh },
        { statusHonorarium: statusHonorarium },
      ],
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
