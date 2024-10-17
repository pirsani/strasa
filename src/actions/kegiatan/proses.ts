"use server";
import { dbHonorarium } from "@/lib/db-honorarium";

import {
  JENIS_PENGAJUAN,
  Kegiatan,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";
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
      status: "pengajuan",
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

export const updateStatusRampungan = async (
  kegiatanId: string,
  statusRampunganBaru: STATUS_PENGAJUAN
): Promise<ActionResponse<KegiatanWithDetail>> => {
  // TODO check permission disini untuk update status rampungan
  // allowed status: pengajuan, terverifikasi, revisi, ditolak, selesai

  let updateStatusRampungan;
  try {
    const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findFirst({
      where: {
        kegiatanId,
        jenis: "GENERATE_RAMPUNGAN",
      },
    });

    if (!riwayatPengajuan) {
      return {
        success: false,
        error: "E-KUSLN01",
        message: "Silakan coba refresh halaman ini",
      };
    }
    const updateRiwayatPengajuan = await dbHonorarium.riwayatPengajuan.update({
      where: {
        id: riwayatPengajuan.id,
      },
      data: {
        status: statusRampunganBaru,
      },
    });
  } catch (error) {}

  const kegiatan = await getKegiatan(kegiatanId);
  if (!kegiatan) {
    // harusnya tidak akan pernah sampai ke sini
    return {
      success: false,
      error: "E-KUSLN01",
      message: "Silakan coba refresh halaman ini",
    };
  }

  console.log("[updateStatusRampungan]", updateStatusRampungan);
  return {
    success: true,
    data: kegiatan,
  };
};

export const updateStatusUhLuarNegeri = async (
  kegiatanId: string,
  statusUhLuarNegeriBaru: STATUS_PENGAJUAN
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
      error: "E-URPSLN-01",
      message: "Error update Status Uh Luar Negeri",
    };
  }
};

export const updateStatusUhDalamNegeri = async (
  kegiatanId: string,
  statusUhDalamNegeriBaru: STATUS_PENGAJUAN
): Promise<ActionResponse<Kegiatan>> => {
  try {
    const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findFirst({
      where: {
        kegiatanId,
        jenis: "UH_DALAM_NEGERI",
      },
    });
    if (!riwayatPengajuan) {
      return {
        success: false,
        error: "E-URPSDN-01",
        message: "Silakan coba refresh halaman ini",
      };
    }
    const updateRiwayatPengajuan = await dbHonorarium.riwayatPengajuan.update({
      where: {
        id: riwayatPengajuan.id,
      },
      data: {
        status: statusUhDalamNegeriBaru,
      },
    });
  } catch (error) {}
  const kegiatan = await getKegiatan(kegiatanId);
  if (!kegiatan) {
    // harusnya tidak akan pernah sampai ke sini
    return {
      success: false,
      error: "E-KUSLN01",
      message: "Silakan coba refresh halaman ini",
    };
  }

  console.log("[updateStatusRampungan]", updateStatusRampungan);
  return {
    success: true,
    data: kegiatan,
  };
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
