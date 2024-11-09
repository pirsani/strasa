"use server";

import { moveFileToFinalFolder } from "@/actions/file";
import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { getPrismaErrorResponse } from "@/actions/prisma-error-response";
import { ActionResponse } from "@/actions/response";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { getJadwalByRiwayatPengajuanId } from "@/data/jadwal";
import { getJadwalIncludeKegiatan } from "@/data/narasumber/jadwal";
import { dbHonorarium } from "@/lib/db-honorarium";
import { getBesaranPajakHonorarium, getDpp } from "@/lib/pajak";
import { NominatifPembayaranWithoutFile } from "@/zod/schemas/nominatif-pembayaran";
import { createId } from "@paralleldrive/cuid2";
import { JENIS_PENGAJUAN, STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import fse from "fs-extra";
import path from "path";
import { Logger } from "tslog";

const logger = new Logger({
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

interface ObjCreateRiwayatPengajuan {
  jenis: JENIS_PENGAJUAN;
  status: STATUS_PENGAJUAN;
  diajukanOlehId: string;
  diajukanTanggal: Date;
}

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

  let objRiwayatPengajuanUpdate: ObjRiwayatPengajuanUpdate = {
    status: status,
  };

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
  jadwalNarasumberId: string,
  jumlahJp: number,
  jenisHonorariumId: string | null
): Promise<ActionResponse<Boolean>> => {
  console.log(jadwalNarasumberId, jumlahJp, jenisHonorariumId);

  if (!jenisHonorariumId) {
    return {
      success: false,
      message: "Jenis Honorarium harus dipilih",
      error: "E-UJP-003",
    };
  }

  const sbmHonorarium = await dbHonorarium.sbmHonorarium.findFirst({
    where: {
      id: jenisHonorariumId,
    },
  });

  if (!sbmHonorarium) {
    return {
      success: false,
      message: "Jenis Honorarium tidak ditemukan",
      error: "E-UJP-004",
    };
  }

  const jadwalNarasumber = await dbHonorarium.jadwalNarasumber.findFirst({
    where: {
      id: jadwalNarasumberId,
    },
    include: {
      narasumber: true,
    },
  });

  if (!jadwalNarasumber || !jadwalNarasumber.jumlahJamPelajaran) {
    return {
      success: false,
      message: "Jadwal Narasumber tidak ditemukan",
      error: "E-UJP-005",
    };
  }

  const jumlahBruto = jadwalNarasumber.jumlahJamPelajaran.times(
    sbmHonorarium.besaran
  );

  const pangkatGolonganId = jadwalNarasumber.narasumber.pangkatGolonganId;
  const npwp = jadwalNarasumber.narasumber.NPWP;
  const tarifPajak = getBesaranPajakHonorarium(pangkatGolonganId, npwp);
  const pajakDPP = getDpp(jumlahBruto, pangkatGolonganId);
  const pph21 = pajakDPP.times(tarifPajak.besaranPajak);
  const jumlahDiterima = jumlahBruto.minus(pph21);

  logger.debug(
    tarifPajak.besaranPajak.toString(),
    pajakDPP.toString(),
    pph21.toString(),
    jumlahDiterima.toString()
  );

  try {
    const updateStatus = await dbHonorarium.jadwalNarasumber.update({
      where: {
        id: jadwalNarasumberId,
      },
      data: {
        jumlahJamPelajaran: jumlahJp,
        jenisHonorariumId: jenisHonorariumId,
        besaranHonorarium: sbmHonorarium.besaran,
        pajakTarif: tarifPajak.besaranPajak,
        pajakDPP: pajakDPP,
        pph21: pph21,
        jumlahDiterima: jumlahDiterima,
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
    logger.error("[updateJumlahJpJadwalNarasumber]", error);
    return {
      success: false,
      message: "failed to save data",
      error: "E-UJP-002",
    };
  }
};

export const updateBendaharaPpkNominatifHonorarium = async (
  jadwalId: string,
  bendaharaId: string,
  ppkId: string
): Promise<ActionResponse<Boolean>> => {
  const jadwal = await dbHonorarium.jadwal.findFirst({
    where: {
      id: jadwalId,
    },
  });

  if (!jadwal || !jadwal.riwayatPengajuanId) {
    return {
      success: false,
      message: "Jadwal not found",
      error: "E-UBP-001",
    };
  }

  const riwayatPengajuanId = jadwal.riwayatPengajuanId;

  let objRiwayatPengajuanUpdate: ObjRiwayatPengajuanUpdate = {
    status: "APPROVED",
    bendaharaId: bendaharaId,
    ppkId: ppkId,
  };

  try {
    const transaction = await dbHonorarium.$transaction(async (prisma) => {
      const updateRiwayatPengajuan = await prisma.riwayatPengajuan.update({
        where: {
          id: riwayatPengajuanId || createId(),
        },
        data: {
          ...objRiwayatPengajuanUpdate,
        },
      });
    });
  } catch (error) {
    logger.error("[updateBendaharaPpkNominatifHonorarium]", error);
    return getPrismaErrorResponse(error as Error);
  }
  return {
    success: true,
    data: true,
  };
};

export const pengajuanPembayaranHonorarium = async (
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
    if (!data.jadwalId || !data.bendaharaId || !data.ppkId) {
      return {
        success: false,
        error: "E-RTP-001",
        message: "Data tidak lengkap",
      };
    }

    const jadwal = await dbHonorarium.jadwal.findFirst({
      where: {
        id: data.jadwalId,
      },
      include: {
        kegiatan: true,
      },
    });

    if (!jadwal || !jadwal.riwayatPengajuanId) {
      return {
        success: false,
        error: "E-RTP-002",
        message: "Jadwal not found",
      };
    }

    const tahun = jadwal.kegiatan.tanggalMulai.getFullYear().toString();

    const tempPath = path.posix.join(BASE_PATH_UPLOAD, "temp", data.kegiatanId);
    const finalPath = path.posix.join(
      BASE_PATH_UPLOAD,
      tahun,
      data.kegiatanId,
      "jadwal-kelas-narasumber",
      data.jadwalId
    );

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
        id: jadwal.riwayatPengajuanId,
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
    logger.error("[pengajuanPembayaranHonorarium]", error);
    return {
      success: false,
      error: "E-RTP-003",
      message: "unknown error. please contact administrator",
    };
  }
};

export const updateBuktiPembayaranHonorarium = async (
  riwayatPengajuanId: string,
  buktiPembayaranCuid: string
): Promise<ActionResponse<STATUS_PENGAJUAN>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }
  const jadwal = await getJadwalByRiwayatPengajuanId(riwayatPengajuanId);
  if (!jadwal || !jadwal.riwayatPengajuan || !jadwal.kegiatan) {
    return {
      success: false,
      error: "E-UPPH-001",
      message: "Jadwal not found or Riwayat pengajuan not found",
    };
  }
  if (jadwal.riwayatPengajuan.status !== "REQUEST_TO_PAY") {
    return {
      success: false,
      error: "E-UPPH-002",
      message: `Riwayat pengajuan status [${jadwal.riwayatPengajuan.status}] not valid for this action`,
    };
  }

  // find uploaded file and then move it to final folder
  const tahun = jadwal.kegiatan.tanggalMulai.getFullYear().toString();

  const tempPath = path.posix.join(
    BASE_PATH_UPLOAD,
    "temp",
    riwayatPengajuanId
  );
  const finalPath = path.posix.join(
    BASE_PATH_UPLOAD,
    tahun,
    jadwal.kegiatanId,
    "jadwal-kelas-narasumber",
    jadwal.id
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

const pengecekanPengguna = async () => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }
  // TODO memastikan bahwa pengguna yang mengajukan adalah satker pengguna yang terkait dengan kegiatan
  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  const penggunaName = pengguna.data.penggunaName;
};

export default updateStatusPengajuanPembayaran;
