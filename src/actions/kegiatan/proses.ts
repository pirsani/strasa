"use server";
import { dbHonorarium } from "@/lib/db-honorarium";

import { JENIS_PENGAJUAN, Kegiatan } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
import { KegiatanWithDetail } from ".";
import { getSessionPenggunaForAction } from "../pengguna";
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

  const updateStatusRampungan = await dbHonorarium.kegiatan.update({
    where: {
      id: kegiatanId,
    },
    data: {
      statusRampungan: "pengajuan",
    },
    include: {
      itinerary: true,
      provinsi: true,
      dokumenKegiatan: true,
    },
  });
  console.log("[createLogProses]", updateStatusRampungan);

  const buatPengajuan = await dbHonorarium.riwayatPengajuan.create({
    data: {
      jenis: "GENERATE_RAMPUNGAN",
      kegiatanId,
      diajukanOlehId: penggunaId,
      tanggalPengajuan: new Date(),
      status: "SUBMITTED",
      createdBy: penggunaId,
    },
  });
  console.log("[createPengajuan]", buatPengajuan);

  const createLogProses = await dbHonorarium.logProses.create({
    data: {
      kegiatanId,
      jenis: JENIS_PENGAJUAN.GENERATE_RAMPUNGAN,
      keterangan: "Generate Rampungan",
      status: "pengajuan",
      createdBy: "admin",
      tglStatus: new Date(),
    },
  });
  console.log("[createLogProses]", createLogProses);
  revalidatePath("/pengajuan");
  return {
    success: true,
    data: updateStatusRampungan,
  };
};

export type StatusRampungan =
  | "pengajuan"
  | "terverifikasi"
  | "revisi"
  | "ditolak"
  | "selesai";
export const updateStatusRampungan = async (
  kegiatanId: string,
  statusRampunganBaru: StatusRampungan
): Promise<ActionResponse<KegiatanWithDetail>> => {
  // TODO check permission disini untuk update status rampungan
  // allowed status: pengajuan, terverifikasi, revisi, ditolak, selesai

  let updateStatusRampungan;
  try {
    updateStatusRampungan = await dbHonorarium.kegiatan.update({
      where: {
        id: kegiatanId,
      },
      data: {
        statusRampungan: statusRampunganBaru,
      },
      include: {
        itinerary: true,
        provinsi: true,
        dokumenKegiatan: true,
      },
    });
  } catch (error) {
    console.error("Error updateStatusRampungan", error);
    return {
      success: false,
      error: "Error updateStatusRampungan",
      message: "Error updateStatusRampungan",
    };
  }

  console.log("[updateStatusRampungan]", updateStatusRampungan);
  return {
    success: true,
    data: updateStatusRampungan,
  };
};

// "setup",
// "pengajuan",
// "verifikasi",
// "nominatif",
// "pembayaran",
// "selesai",
export type Status =
  | "pengajuan"
  | "terverifikasi"
  | "revisi"
  | "nominatif"
  | "pembayaran"
  | "dibayar"
  | "ditolak"
  | "selesai";

export const updateStatusUhLuarNegeri = async (
  kegiatanId: string,
  statusUhLuarNegeriBaru: Status
): Promise<ActionResponse<KegiatanWithDetail>> => {
  try {
    const updatedKegiatan = await dbHonorarium.kegiatan.update({
      where: {
        id: kegiatanId,
      },
      data: {
        statusUhLuarNegeri: statusUhLuarNegeriBaru,
      },
      include: {
        itinerary: true,
        provinsi: true,
        dokumenKegiatan: true,
      },
    });
    console.log("[updatedKegiatan]", updatedKegiatan);
    return {
      success: true,
      data: updatedKegiatan,
    };
  } catch (error) {
    logger.error("Error updateStatusUhLuarNegeri", error);
    return {
      success: false,
      error: "E-KUSLN01",
      message: "Error update Status Uh Luar Negeri",
    };
  }
};

export const updateStatusUhDalamNegeri = async (
  kegiatanId: string,
  statusUhDalamNegeriBaru: Status
): Promise<ActionResponse<Kegiatan>> => {
  try {
    const updatedKegiatan = await dbHonorarium.kegiatan.update({
      where: {
        id: kegiatanId,
      },
      data: {
        statusUhDalamNegeri: statusUhDalamNegeriBaru,
      },
    });
    console.log("[updatedKegiatan]", updatedKegiatan);
    return {
      success: true,
      data: updatedKegiatan,
    };
  } catch (error) {
    logger.error("Error updateStatusUhDalamNegeri", error);
    return {
      success: false,
      error: "E-KUSLN01",
      message: "Error update Status Uh Dalam Negeri",
    };
  }
};
