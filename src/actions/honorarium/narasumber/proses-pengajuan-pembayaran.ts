"use server";

import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { getPrismaErrorResponse } from "@/actions/prisma-error-response";
import { ActionResponse } from "@/actions/response";
import { getJadwalIncludeKegiatan } from "@/data/narasumber/jadwal";
import { dbHonorarium } from "@/lib/db-honorarium";
import { getBesaranPajakHonorarium, getDpp } from "@/lib/pajak";
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

export default updateStatusPengajuanPembayaran;
