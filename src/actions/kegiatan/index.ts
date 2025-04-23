"use server";

import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
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
  Spd,
} from "@prisma-honorarium/client";
import { Logger } from "tslog";
import { getTahunAnggranPilihan } from "../pengguna/preference";

const logger = new Logger({
  hideLogPositionForProduction: true,
  name: "KEGIATAN",
});

export interface KegiatanIncludeSatker extends Kegiatan {
  satker: Organisasi;
  unitKerja: Organisasi;
}

export interface ParamsGetKegiatan {
  satkerId?: string;
  unitKerjaId?: string;
}
export const getKegiatan = async ({
  satkerId,
  unitKerjaId,
}: ParamsGetKegiatan = {}): Promise<KegiatanIncludeSatker[]> => {
  const tahunAnggaran = await getTahunAnggranPilihan();
  console.log(
    "[getKegiatan] tahunAnggaran",
    tahunAnggaran,
    satkerId,
    unitKerjaId
  );

  // console.log("[getKegiatan] satkerId", satkerId);
  // console.log("[getKegiatan] unitKerjaId", unitKerjaId);

  const dataKegiatan = await dbHonorarium.kegiatan.findMany({
    where: {
      tanggalMulai: {
        gte: new Date(`${tahunAnggaran}-01-01`),
        lte: new Date(`${tahunAnggaran}-12-31`),
      },
      ...(satkerId && { satkerId }),
      ...(unitKerjaId && { unitKerjaId }),
    },
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
  spd?: Spd | null;
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
      spd: true,
    },
  });

  console.log(kegiatan);
  return kegiatan;
};

export const getOptionsKegiatan = async () => {
  logger.info("getOptionsKegiatan");

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) return [];

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;

  // TODO: permission check
  type AccessKegiatanLevel = "SATKER" | "UNIT_KERJA" | "ADMIN";
  let accessKegiatanLevel: AccessKegiatanLevel;
  if (satkerId === unitKerjaId) {
    accessKegiatanLevel = "SATKER";
  } else {
    accessKegiatanLevel = "UNIT_KERJA";
  }

  const isOnLevelSatker = accessKegiatanLevel == "SATKER" ? true : false;

  // hanya dapat memilih yang ada di satker dan unit kerja yang dipilih
  // jika admin dapat memilih pada satkernya jika tidak makan hanya dapat memilih pada unitKerjaId dan satkerId sesuai pengguna

  const tahunAnggaran = await getTahunAnggranPilihan();
  const dataKegiatan = await dbHonorarium.kegiatan.findMany({
    where: {
      tanggalMulai: {
        gte: new Date(`${tahunAnggaran}-01-01`),
        lte: new Date(`${tahunAnggaran}-12-31`),
      },
      satkerId: satkerId,
      ...(!isOnLevelSatker && { unitKerjaId: unitKerjaId }),
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

  logger.info("getOptionsKegiatan");

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) return [];

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;

  // TODO: permission check
  type AccessKegiatanLevel = "SATKER" | "UNIT_KERJA" | "ADMIN";
  let accessKegiatanLevel: AccessKegiatanLevel;
  if (satkerId === unitKerjaId) {
    accessKegiatanLevel = "SATKER";
  } else {
    accessKegiatanLevel = "UNIT_KERJA";
  }

  const isOnLevelSatker = accessKegiatanLevel == "SATKER" ? true : false;

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
      satkerId: satkerId,
      ...(!isOnLevelSatker && { unitKerjaId: unitKerjaId }), // dynamically add where clause here
    },
  });
  const optionsKegiatan = kegiatans.map((kegiatan) => ({
    value: kegiatan.id,
    label: kegiatan.nama,
  }));
  return optionsKegiatan;
};
