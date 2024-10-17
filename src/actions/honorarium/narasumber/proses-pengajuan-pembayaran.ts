"use server";

import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { getPrismaErrorResponse } from "@/actions/prisma-error-response";
import { ActionResponse } from "@/actions/response";
import { getJadwalIncludeKegiatan } from "@/data/narasumber/jadwal";
import { dbHonorarium } from "@/lib/db-honorarium";
import { createId } from "@paralleldrive/cuid2";
import { JENIS_PENGAJUAN, STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import { Logger } from "tslog";

const logger = new Logger({
  hideLogPositionForProduction: true,
});

const updateStatusPengajuanPembayaran = async (
  jadwalId: string,
  status: STATUS_PENGAJUAN,
  catatanRevisi?: string
): Promise<ActionResponse<STATUS_PENGAJUAN>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const jadwal = await getJadwalIncludeKegiatan(jadwalId);

  if (!jadwal) {
    return {
      success: false,
      error: "Jadwal not found",
    };
  }

  const kegiatanId = jadwal.kegiatanId;
  const riwayatPengajuanId = jadwal.riwayatPengajuanId;

  // TODO memastikan bahwa pengguna yang mengajukan adalah satker pengguna yang terkait dengan kegiatan
  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  const penggunaName = pengguna.data.penggunaName;

  interface ObjRiwayatPengajuanUpdate {
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

  let objRiwayatPengajuanUpdate: ObjRiwayatPengajuanUpdate = {
    status: status,
  };

  interface ObjCreateRiwayatPengajuan {
    jenis: JENIS_PENGAJUAN;
    status: STATUS_PENGAJUAN;
    diajukanOlehId: string;
    diajukanTanggal: Date;
  }

  let objCreateRiwayatPengajuan: ObjCreateRiwayatPengajuan = {
    status: "SUBMITTED",
    jenis: "HONORARIUM",
    diajukanOlehId: penggunaId,
    diajukanTanggal: new Date(),
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

  // jika pengajuan maka update staus untuk seluruh kegiatan menjadi submitted

  try {
    const transaction = await dbHonorarium.$transaction(async (prisma) => {
      const upsertRiwayatPengajuan = await prisma.riwayatPengajuan.upsert({
        where: {
          id: riwayatPengajuanId || createId(),
        },
        update: {
          ...objRiwayatPengajuanUpdate,
        },
        create: {
          kegiatanId: kegiatanId,
          ...objCreateRiwayatPengajuan,
          createdBy: penggunaId,
        },
      });

      if (!riwayatPengajuanId) {
        // update jadwal riwayatPengajuanId
        const updateJadwal = await prisma.jadwal.update({
          where: {
            id: jadwalId,
          },
          data: {
            riwayatPengajuanId: upsertRiwayatPengajuan.id,
          },
        });
      }
    });
  } catch (error) {
    logger.error("[updateStatusPengajuanPembayaran]", error);
    return getPrismaErrorResponse(error as Error);
  }

  return {
    success: true,
    data: status,
  };
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
