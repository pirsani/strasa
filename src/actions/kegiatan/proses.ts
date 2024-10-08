"use server";
import { dbHonorarium } from "@/lib/db-honorarium";

import { JENIS_PENGAJUAN, Kegiatan } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
import { KegiatanWithDetail } from ".";
import { ActionResponse } from "../response";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getStatusPengajuanGenerateRampungan = async (
  kegiatanId: string
) => {
  const existingRiwayatProses = await dbHonorarium.riwayatProses.findFirst({
    where: {
      kegiatanId,
      jenis: JENIS_PENGAJUAN.GENERATE_RAMPUNGAN,
    },
  });

  return existingRiwayatProses;
};

export const getRiwayatProses = async (kegiatanId: string) => {
  const riwayat = await dbHonorarium.riwayatProses.findMany({
    where: {
      kegiatanId,
    },
  });

  return riwayat;
};

export const pengajuanGenerateRampungan = async (kegiatanId: string) => {
  //jika sudah ada pengajuan generate rampungan, maka update status pengajuannya dan tanggal statusnya

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
  console.log("[createRiwayatProses]", updateStatusRampungan);

  const createRiwayatProses = await dbHonorarium.riwayatProses.create({
    data: {
      kegiatanId,
      jenis: JENIS_PENGAJUAN.GENERATE_RAMPUNGAN,
      keterangan: "Generate Rampungan",
      status: "pengajuan",
      createdBy: "admin",
      tglStatus: new Date(),
    },
  });
  console.log("[createRiwayatProses]", createRiwayatProses);
  revalidatePath("/pengajuan");
  return updateStatusRampungan;
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
