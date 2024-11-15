"use server";

import { moveFileToFinalFolder } from "@/actions/file";
import { getSessionPenggunaForAction } from "@/actions/pengguna";
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
  name: "updateDokumenAkhir",
  hideLogPositionForProduction: true,
});

const UpdateDokumenAkhirRiwayatPengajuan = async ({
  riwayatPengajuanId,
  dokumentasi,
  laporan,
}: {
  riwayatPengajuanId: string;
  dokumentasi?: string | null;
  laporan?: string | null;
}): Promise<ActionResponse<STATUS_PENGAJUAN>> => {
  console.log(riwayatPengajuanId, dokumentasi, laporan);

  try {
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
    const tahun = riwayatPengajuan.kegiatan.tanggalMulai
      .getFullYear()
      .toString();

    const tempPath = path.posix.join(
      BASE_PATH_UPLOAD,
      "temp",
      riwayatPengajuan.id
    );
    const finalPath = path.posix.join(
      BASE_PATH_UPLOAD,
      tahun,
      riwayatPengajuan.kegiatanId,
      riwayatPengajuan.id
    );

    const tempFileDokumentasi = dokumentasi + ".pdf";
    const tempFileLaporan = laporan + ".pdf";
    const finalNamafileDokumentasi = "dokumentasi_" + dokumentasi + ".pdf";
    const finalNamafileLaporan = "laporan_" + laporan + ".pdf";

    const finalPathDokumentasi = await moveFile({
      finalPath,
      finalNamafile: finalNamafileDokumentasi,
      tempPath,
      tempFile: tempFileDokumentasi,
    });

    const finalPathLaporan = await moveFile({
      finalPath,
      finalNamafile: finalNamafileLaporan,
      tempPath,
      tempFile: tempFileLaporan,
    });

    const objRiwayatPengajuanUpdate: ObjRiwayatPengajuanUpdate = {
      status: riwayatPengajuan.status,
      dokumentasi: finalPathDokumentasi,
      dokumenLaporanKegiatan: finalPathLaporan,
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
        error: "E-RTP-002",
        message: "Gagal update",
      };
    }

    return {
      success: true,
      data: riwayatPengajuan.status,
      message: "Dokumen akhir riwayat pengajuan berhasil diupdate",
    };
  } catch (error) {
    const customError = error as Error;
    console.log(error);
    return {
      success: false,
      error: "E-RTP-002",
      message: `Gagal update dokumen akhir riwayat pengajuan: ${customError.name}`,
    };
  }
};

const moveFile = async ({
  finalPath,
  finalNamafile,
  tempPath,
  tempFile,
}: {
  finalPath: string;
  finalNamafile: string;
  tempPath: string;
  tempFile: string;
}): Promise<string | null> => {
  try {
    const finalPathFile = path.posix.join(finalPath, finalNamafile);
    const tempPathFile = path.posix.join(tempPath, tempFile);
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
      return null;
    }

    await moveFileToFinalFolder(resolvedTempPathFile, resolvedPathFile);
    const relativePath = path.posix.relative(BASE_PATH_UPLOAD, finalPathFile);
    return relativePath;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default UpdateDokumenAkhirRiwayatPengajuan;
