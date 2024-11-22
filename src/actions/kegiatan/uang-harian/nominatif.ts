"use server";
import { moveFileToFinalFolder } from "@/actions/file";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { ActionResponse } from "@/actions/response";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { JENIS_PENGAJUAN, STATUS_PENGAJUAN } from "@/lib/constants";
import { dbHonorarium } from "@/lib/db-honorarium";
import { NominatifPembayaranWithoutFile } from "@/zod/schemas/nominatif-pembayaran";
import fse from "fs-extra";
import path from "path";
import { Logger } from "tslog";
const logger = new Logger({
  name: "pengajuan-pembayaran-uang-harian",
  hideLogPositionForProduction: true,
});

interface ObjRiwayatPengajuanUpdate {
  status: STATUS_PENGAJUAN;
  diverifikasiOlehId?: string;
  disetujuiOlehId?: string;
  dimintaPembayaranOlehId?: string;
  dibayarOlehId?: string;
  diselesaikanOlehId?: string;
  catatanRevisi?: string;
  catatanPermintaaPembayaran?: string;

  diverifikasiTanggal?: Date;
  disetujuiTanggal?: Date;
  dimintaPembayaranTanggal?: Date;
  dibayarTanggal?: Date;
  diselesaikanTanggal?: Date;

  ppkId?: string;
  bendaharaId?: string;

  dokumenBuktiPajak?: string;
  dokumenBuktiPembayaran?: string;
}

export const pengajuanPembayaranUangHarian = async (
  data: NominatifPembayaranWithoutFile
): Promise<ActionResponse<NominatifPembayaranWithoutFile>> => {
  let objRiwayatPengajuanUpdate: ObjRiwayatPengajuanUpdate = {
    status: "REQUEST_TO_PAY",
  };

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }
  // TODO memastikan bahwa pengguna yang mengajukan adalah satker pengguna yang terkait dengan kegiatan
  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  const penggunaName = pengguna.data.penggunaName;

  objRiwayatPengajuanUpdate.dimintaPembayaranOlehId = penggunaId;
  objRiwayatPengajuanUpdate.dimintaPembayaranTanggal = new Date();
  objRiwayatPengajuanUpdate.catatanPermintaaPembayaran = data.catatan;

  try {
    if (!data.bendaharaId || !data.ppkId) {
      return {
        success: false,
        error: "E-RTP-001",
        message: "Data tidak lengkap",
      };
    }

    const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findFirst({
      where: {
        kegiatanId: data.kegiatanId,
        jenis: data.jenisPengajuan as JENIS_PENGAJUAN,
      },
      include: {
        kegiatan: true,
      },
    });

    if (!riwayatPengajuan || !riwayatPengajuan.kegiatan) {
      return {
        success: false,
        error: "E-RTP-002",
        message: "Kegiatan tidak ditemukan",
      };
    }

    const kegiatan = riwayatPengajuan.kegiatan;

    const tahun = kegiatan.tanggalMulai.getFullYear().toString();

    const tempPath = path.posix.join(BASE_PATH_UPLOAD, "temp", data.kegiatanId);
    const finalPath = path.posix.join(BASE_PATH_UPLOAD, tahun, data.kegiatanId);

    const finalPathFile = path.posix.join(finalPath, data.buktiPajakCuid);
    const tempPathFile = path.posix.join(tempPath, data.buktiPajakCuid);
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
    objRiwayatPengajuanUpdate.dokumenBuktiPajak = relativePath;

    logger.debug(objRiwayatPengajuanUpdate);

    const upsertRiwayatPengajuan = await dbHonorarium.riwayatPengajuan.update({
      where: {
        id: riwayatPengajuan.id,
      },
      data: {
        ...objRiwayatPengajuanUpdate,
      },
    });

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    logger.error("[pengajuanPembayaranUangHarian]", error);
    return {
      success: false,
      error: "E-RTP-003",
      message: "unknown error. please contact administrator",
    };
  }
};
