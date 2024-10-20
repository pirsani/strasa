"use server";
import { dbHonorarium } from "@/lib/db-honorarium";

import { generateNomorSpd } from "@/lib/spd";
import { Spd as ZSpd } from "@/zod/schemas/spd";
import { createId } from "@paralleldrive/cuid2";
import {
  JENIS_PENGAJUAN,
  Kegiatan,
  Spd,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
import { KegiatanWithDetail } from ".";
import { getSessionPenggunaForAction } from "../pengguna";
import { getPrismaErrorResponse } from "../prisma-error-response";
import { ActionResponse } from "../response";

// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getStatusPengajuanGenerateRampungan = async (
  kegiatanId: string
) => {
  const existingLogProses = await dbHonorarium.logProses.findFirst({
    where: {
      kegiatanId,
      jenis: JENIS_PENGAJUAN.GENERATE_RAMPUNGAN,
    },
  });

  return existingLogProses;
};

export const getLogProses = async (kegiatanId: string) => {
  const riwayat = await dbHonorarium.logProses.findMany({
    where: {
      kegiatanId,
    },
  });

  return riwayat;
};

export const pengajuanGenerateRampungan = async (
  kegiatanId: string
): Promise<ActionResponse<KegiatanWithDetail>> => {
  //jika sudah ada pengajuan generate rampungan, maka update status pengajuannya dan tanggal statusnya

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }
  const penggunaId = pengguna.data.penggunaId;
  const satkerId = pengguna.data.satkerId;

  // console.log("[createLogProses]", updateStatusRampungan);

  // check if pengajuan already exists
  const existingPengajuan = await dbHonorarium.riwayatPengajuan.findFirst({
    where: {
      kegiatanId,
      jenis: "GENERATE_RAMPUNGAN",
      OR: [
        {
          status: "SUBMITTED",
        },
        {
          status: "REVISE",
        },
      ],
    },
  });

  if (existingPengajuan) {
    //jika sudah ada pengajuan generate rampungan, maka update status pengajuannya dan tanggal statusnya
    const buatPengajuan = await dbHonorarium.riwayatPengajuan.update({
      where: {
        id: existingPengajuan.id,
      },
      data: {
        jenis: "GENERATE_RAMPUNGAN",
        diajukanOlehId: penggunaId,
        diajukanTanggal: new Date(),
        status: "SUBMITTED",
        updatedBy: penggunaId,
      },
    });
  } else {
    // create new pengajuan
    const buatPengajuan = await dbHonorarium.riwayatPengajuan.create({
      data: {
        jenis: "GENERATE_RAMPUNGAN",
        kegiatanId,
        diajukanOlehId: penggunaId,
        diajukanTanggal: new Date(),
        status: "SUBMITTED",
        createdBy: penggunaId,
      },
    });
  }

  // create log proses
  const createLogProses = await dbHonorarium.logProses.create({
    data: {
      kegiatanId,
      jenis: JENIS_PENGAJUAN.GENERATE_RAMPUNGAN,
      keterangan: "Generate Rampungan",
      status: "SUBMITTED",
      createdBy: "admin",
      tglStatus: new Date(),
    },
  });

  // cari kegiatan dengan id yang sama sebagai kembalian data
  const kegiatan = await getKegiatan(kegiatanId);
  if (!kegiatan) {
    // harusnya tidak akan pernah sampai ke sini
    return {
      success: false,
      error: "E-KUSLN01",
      message: "Silakan coba refresh halaman ini",
    };
  }

  revalidatePath("/pengajuan");
  return {
    success: true,
    data: kegiatan,
  };
};

export const generateSpd = async (spd: ZSpd): Promise<ActionResponse<Spd>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return {
      success: false,
      error: "E-UAuth-01",
      message: "User not found",
    };
  }
  //TODO CHECK PERMISSION here
  const { penggunaId, satkerId } = pengguna.data;

  // check if already have spd
  const kegiatan = await dbHonorarium.kegiatan.findFirst({
    where: {
      id: spd.kegiatanId,
      satkerId,
    },
    include: {
      spd: true,
      ppk: true,
      unitKerja: true,
    },
  });

  let upsertedSpd: Spd | null = null;
  if (kegiatan) {
    // find the latest spd
    const tahunKegiatan = kegiatan.tanggalMulai.getFullYear();
    const latestSpd = await dbHonorarium.spd.findFirst({
      where: {
        createdAt: {
          gte: new Date(tahunKegiatan, 0, 1),
          lte: new Date(tahunKegiatan, 11, 31),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const nomorBaru = generateNomorSpd("18", latestSpd?.nomorSPD);
    const asWas = {
      ...spd,
    };
    const upsertedSpd = await dbHonorarium.spd.upsert({
      where: {
        id: kegiatan.spd?.id || createId(),
      },
      create: {
        nomorSPD: nomorBaru,
        tanggalSPD: new Date(),
        createdBy: penggunaId,
        createdAt: new Date(),
        asWas: asWas,
      },
      update: {
        updatedBy: penggunaId,
        updatedAt: new Date(),
        asWas: asWas,
      },
    });

    const updateKegiatan = await dbHonorarium.kegiatan.update({
      where: {
        id: spd.kegiatanId,
      },
      data: {
        spdId: upsertedSpd.id,
        ppkId: spd.ppkId,
      },
    });

    return {
      success: true,
      data: upsertedSpd,
    };
  } else {
    return {
      success: false,
      error: "E-KUSLN01",
      message: "Silakan coba refresh halaman ini",
    };
  }
};

const upsertRiwayatPengajuan = async (
  kegiatanId: string,
  status: STATUS_PENGAJUAN,
  jenis: JENIS_PENGAJUAN,
  catatan?: string | null
): Promise<ActionResponse<KegiatanWithDetail>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return {
      success: false,
      error: "E-UAuth-01",
      message: "User not found",
    };
  }
  //TODO CHECK PERMISSION here
  const penggunaId = pengguna.data.penggunaId;
  const satkerId = pengguna.data.satkerId;

  try {
    // find riwayat pengajuan
    const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findFirst({
      where: {
        kegiatanId,
        jenis,
      },
    });

    const objUpdateRiwayatPengajuan = createObjUpdateRiwayatPengajuan(
      status,
      penggunaId,
      catatan
    );

    const updateRiwayatPengajuan = await dbHonorarium.riwayatPengajuan.upsert({
      where: {
        id: riwayatPengajuan?.id || createId(),
      },
      create: {
        kegiatanId,
        status: "SUBMITTED",
        jenis,
        diajukanOlehId: penggunaId,
        diajukanTanggal: new Date(),
        createdBy: penggunaId,
      },
      update: {
        ...objUpdateRiwayatPengajuan,
      },
    });
  } catch (error) {
    logger.error("[updateRiwayatPengajuan]", error);
    return getPrismaErrorResponse(error as Error);
  }

  const kegiatan = await getKegiatan(kegiatanId);
  if (!kegiatan) {
    // harusnya tidak akan pernah sampai ke sini
    return {
      success: false,
      error: "E-KUSLN01",
      message: "Silakan coba refresh halaman ini",
    };
  }

  console.log("[updateRiwayatPengajuan UH]", updateStatusRampungan);
  return {
    success: true,
    data: kegiatan,
  };
};

export const updateStatusRampungan = async (
  kegiatanId: string,
  statusRampunganBaru: STATUS_PENGAJUAN
): Promise<ActionResponse<KegiatanWithDetail>> => {
  // TODO check permission disini untuk update status rampungan
  // allowed status: pengajuan, terverifikasi, revisi, ditolak, selesai

  const updated = await upsertRiwayatPengajuan(
    kegiatanId,
    statusRampunganBaru,
    "GENERATE_RAMPUNGAN"
  );

  return updated;
};

export const updateStatusUhLuarNegeri = async (
  kegiatanId: string,
  statusUhLuarNegeriBaru: STATUS_PENGAJUAN
): Promise<ActionResponse<KegiatanWithDetail>> => {
  const updated = await upsertRiwayatPengajuan(
    kegiatanId,
    statusUhLuarNegeriBaru,
    "UH_LUAR_NEGERI"
  );

  return updated;
};

export const updateStatusUhDalamNegeri = async (
  kegiatanId: string,
  statusUhDalamNegeriBaru: STATUS_PENGAJUAN
): Promise<ActionResponse<Kegiatan>> => {
  const updated = await upsertRiwayatPengajuan(
    kegiatanId,
    statusUhDalamNegeriBaru,
    "UH_DALAM_NEGERI"
  );

  return updated;
};

const getKegiatan = async (
  kegiatanId: string
): Promise<KegiatanWithDetail | null> => {
  const kegiatan = await dbHonorarium.kegiatan.findUnique({
    where: {
      id: kegiatanId,
    },
    include: {
      itinerary: true,
      provinsi: true,
      dokumenKegiatan: true,
      riwayatPengajuan: true,
    },
  });
  return kegiatan;
};

interface ObjUpdateRiwayatPengajuan {
  status: STATUS_PENGAJUAN;
  diverifikasiOlehId?: string;
  disetujuiOlehId?: string;
  dimintaPembayaranOlehId?: string;
  dibayarOlehId?: string;
  diselesaikanOlehId?: string;
  catatanRevisi?: string;

  diverifikasiTanggal?: Date;
  disetujuiTanggal?: Date;
  dimintaPembayaranTanggal?: Date;
  dibayarTanggal?: Date;
  diselesaikanTanggal?: Date;
}

const createObjUpdateRiwayatPengajuan = (
  status: STATUS_PENGAJUAN,
  penggunaId: string,
  catatanRevisi?: string | null
) => {
  let objRiwayatPengajuanUpdate: ObjUpdateRiwayatPengajuan = {
    status: status,
  };
  switch (status) {
    case "SUBMITTED":
      // objRiwayatPengajuanUpdate.diajukanOlehId = penggunaId;
      // objRiwayatPengajuanUpdate.diajukanTanggal = new Date();
      break;
    case "REVISED":
      // objRiwayatPengajuanUpdate.diajukanOlehId = penggunaId;
      // objRiwayatPengajuanUpdate.diajukanTanggal = new Date();
      break;
    case "REVISE":
      objRiwayatPengajuanUpdate.diverifikasiOlehId = penggunaId;
      objRiwayatPengajuanUpdate.diverifikasiTanggal = new Date();
      objRiwayatPengajuanUpdate.catatanRevisi = catatanRevisi || "-";
      break;
    case "VERIFIED":
      objRiwayatPengajuanUpdate.diverifikasiOlehId = penggunaId;
      objRiwayatPengajuanUpdate.diverifikasiTanggal = new Date();
      break;
    case "APPROVED":
      objRiwayatPengajuanUpdate.diverifikasiOlehId = penggunaId;
      objRiwayatPengajuanUpdate.diverifikasiTanggal = new Date();
      objRiwayatPengajuanUpdate.disetujuiOlehId = penggunaId;
      objRiwayatPengajuanUpdate.disetujuiTanggal = new Date();
      break;
    case "REQUEST_TO_PAY":
      objRiwayatPengajuanUpdate.dimintaPembayaranOlehId = penggunaId;
      objRiwayatPengajuanUpdate.dimintaPembayaranTanggal = new Date();
      break;
    case "PAID":
      objRiwayatPengajuanUpdate.dibayarOlehId = penggunaId;
      objRiwayatPengajuanUpdate.dibayarTanggal = new Date();
      break;
    case "DONE":
    case "END":
      objRiwayatPengajuanUpdate.diselesaikanOlehId = penggunaId;
      objRiwayatPengajuanUpdate.diselesaikanTanggal = new Date();
      break;
    default:
      break;
  }

  return objRiwayatPengajuanUpdate;
};
