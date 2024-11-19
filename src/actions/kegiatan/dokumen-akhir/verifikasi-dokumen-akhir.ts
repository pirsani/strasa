"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { ActionResponse } from "@/actions/response";
import { ObjRiwayatPengajuanUpdate } from "@/data/kegiatan/riwayat-pengajuan";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import { dbHonorarium } from "@/lib/db-honorarium";

export const verifikasiDokumenAkhir = async (
  riwayatPengajuanId: string
): Promise<ActionResponse<STATUS_PENGAJUAN>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  try {
    const objRiwayatPengajuanUpdate: ObjRiwayatPengajuanUpdate = {
      status: "END",
      diselesaikanTanggal: new Date(),
      diselesaikanOlehId: pengguna.data.penggunaId,
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
      data: updatedRiwayatPengajuan.status,
      message: "Dokumen akhir riwayat pengajuan berhasil diupdate",
    };
  } catch (error) {
    console.error("verifikasiDokumenAkhir", error);
    return {
      success: false,
      error: "E-VDA-001",
      message: "riwayat pengajuan tidak ditemukan [E-VDA-001]",
    };
  }
};
