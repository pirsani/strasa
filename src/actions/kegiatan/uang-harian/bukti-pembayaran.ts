"use server";
import { moveFileToFinalFolder } from "@/actions/file";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { ActionResponse } from "@/actions/response";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import {
  getRiwayatPengajuanById,
  ObjRiwayatPengajuanUpdate,
} from "@/data/kegiatan/riwayat-pengajuan";
import { dbHonorarium } from "@/lib/db-honorarium";
import { STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import fse from "fs-extra";
import path from "path";
import { Logger } from "tslog";
const logger = new Logger({
  name: "updateBuktiPembayaran",
  hideLogPositionForProduction: true,
});

export const updateBuktiPembayaran = async (
  riwayatPengajuanId: string,
  buktiPembayaranCuid: string
): Promise<ActionResponse<STATUS_PENGAJUAN>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const riwayatPengajuan = await getRiwayatPengajuanById(riwayatPengajuanId);

  if (!riwayatPengajuan || !riwayatPengajuan.kegiatan) {
    return {
      success: false,
      error: "E-RTP-001",
      message: "riwayat pengajuan tidak ditemukan",
    };
  }

  // find uploaded file and then move it to final folder
  const tahun = riwayatPengajuan.kegiatan.tanggalMulai.getFullYear().toString();

  const tempPath = path.posix.join(
    BASE_PATH_UPLOAD,
    "temp",
    riwayatPengajuanId
  );
  const finalPath = path.posix.join(
    BASE_PATH_UPLOAD,
    tahun,
    riwayatPengajuan.kegiatanId
  );

  const fileBuktiPembayaran = buktiPembayaranCuid + ".pdf";
  const finalNamafile = "bukti_bayar_" + fileBuktiPembayaran;

  const finalPathFile = path.posix.join(finalPath, finalNamafile);
  const tempPathFile = path.posix.join(tempPath, fileBuktiPembayaran);
  const resolvedPathFile = path.resolve(finalPathFile);
  const resolvedTempPathFile = path.resolve(tempPathFile);
  // check if temp file exists
  // Get the filename from the resolved path
  const filename = path.basename(resolvedPathFile);
  const fileExists = await fse.pathExists(resolvedTempPathFile);
  if (!fileExists) {
    logger.error(
      `File ${filename} not found in ${resolvedTempPathFile}, skipping moving file to final folder`
    );
    return {
      success: false,
      error: "E-RTP-002",
      message: "file belum terupload",
    };
  }

  await moveFileToFinalFolder(resolvedTempPathFile, resolvedPathFile);
  const relativePath = path.posix.relative(BASE_PATH_UPLOAD, finalPathFile);

  const objRiwayatPengajuanUpdate: ObjRiwayatPengajuanUpdate = {
    status: "PAID",
    dibayarOlehId: pengguna.data.penggunaId,
    dibayarTanggal: new Date(),
    dokumenBuktiPembayaran: relativePath,
  };

  const updatedRiwayatPengajuan = await dbHonorarium.riwayatPengajuan.update({
    where: {
      id: riwayatPengajuanId,
    },
    data: {
      ...objRiwayatPengajuanUpdate,
    },
  });

  if (!updatedRiwayatPengajuan) {
    return {
      success: false,
      error: "E-UPPH-003",
      message: "failed to update riwayat pengajuan",
    };
  }

  return {
    success: true,
    data: "PAID",
  };
};
