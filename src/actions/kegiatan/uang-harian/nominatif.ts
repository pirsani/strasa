"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { ActionResponse } from "@/actions/response";
import { JENIS_PENGAJUAN, STATUS_PENGAJUAN } from "@/lib/constants";
import { dbHonorarium } from "@/lib/db-honorarium";
import { NominatifPembayaranWithoutFile } from "@/zod/schemas/nominatif-pembayaran";
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
  const objRiwayatPengajuanUpdate: ObjRiwayatPengajuanUpdate = {
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
