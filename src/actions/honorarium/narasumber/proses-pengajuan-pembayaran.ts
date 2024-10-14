"use server";

import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { ActionResponse } from "@/actions/response";
import { StatusLangkah } from "@/lib/constants";
import { dbHonorarium } from "@/lib/db-honorarium";
import { Logger } from "tslog";

const logger = new Logger({
  hideLogPositionForProduction: true,
});

const updateStatusPengajuanPembayaran = async (
  jadwalId: string,
  status: StatusLangkah,
  catatanRevisi?: string
): Promise<ActionResponse<StatusLangkah>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;

  interface ObjJadlwaUpdate {
    statusPengajuanHonorarium: StatusLangkah;
    diajukanOleh?: string;
    diajukanTanggal?: Date;
    diverifikasiOleh?: string;
    diverifikasiTanggal?: Date;
    catatanRevisi?: string;
    disetujuiOleh?: string;
    disetujuiTanggal?: Date;
    dibayarOleh?: string;
    dibayarTanggal?: Date;
  }

  let objJadlwaUpdate: ObjJadlwaUpdate = {
    statusPengajuanHonorarium: status,
  };
  switch (status) {
    case "Submitted":
      objJadlwaUpdate.diajukanOleh = penggunaId;
      objJadlwaUpdate.diajukanTanggal = new Date();
      break;
    case "Revised":
      objJadlwaUpdate.diajukanOleh = penggunaId;
      objJadlwaUpdate.diajukanTanggal = new Date();
      break;
    case "Revise":
      objJadlwaUpdate.diverifikasiOleh = penggunaId;
      objJadlwaUpdate.diverifikasiTanggal = new Date();
      objJadlwaUpdate.catatanRevisi = catatanRevisi || "-";
      break;
    case "Approved":
      objJadlwaUpdate.diverifikasiOleh = penggunaId;
      objJadlwaUpdate.diverifikasiTanggal = new Date();
      objJadlwaUpdate.disetujuiOleh = penggunaId;
      objJadlwaUpdate.disetujuiTanggal = new Date();
      break;
    case "Paid":
      objJadlwaUpdate.dibayarOleh = penggunaId;
      objJadlwaUpdate.dibayarTanggal = new Date();
      break;
    default:
      break;
  }

  try {
    const updateStatus = await dbHonorarium.jadwal.update({
      where: {
        id: jadwalId,
      },
      data: {
        ...objJadlwaUpdate,
      },
    });
    logger.info("[updateStatusPengajuanPembayaran]", updateStatus);

    if (!updateStatus || !updateStatus.statusPengajuanHonorarium) {
      return {
        success: false,
        error: "Error saving data",
      };
    }

    return {
      success: true,
      data: updateStatus.statusPengajuanHonorarium as StatusLangkah,
    };
  } catch (error) {
    logger.error("[updateStatusPengajuanPembayaran]", error);
    return {
      success: false,
      error: "Error saving data",
    };
  }
};

export const updateJumlahJpJadwalNarasumber = async (
  jadwalId: string,
  jumlahJp: number,
  jenisHonorariumId: string | null
): Promise<ActionResponse<Boolean>> => {
  console.log(jadwalId, jumlahJp, jenisHonorariumId);
  try {
    const updateStatus = await dbHonorarium.jadwalNarasumber.update({
      where: {
        id: jadwalId,
      },
      data: {
        jumlahJamPelajaran: jumlahJp,
        jenisHonorariumId: jenisHonorariumId,
      },
    });

    if (!updateStatus) {
      return {
        success: false,
        message: "failed to save data",
        error: "E-UJP-001",
      };
    }

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      success: false,
      message: "failed to save data",
      error: "E-UJP-002",
    };
  }
};

export default updateStatusPengajuanPembayaran;
