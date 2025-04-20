"use server";
import { ActionResponse } from "@/actions";
import { dbHonorarium } from "@/lib/db-honorarium";

export const updateBendaharaPpkNominatifUhDalamNegeri = async (
  kegiatanId: string,
  bendaharaId: string,
  ppkId: string
): Promise<ActionResponse<boolean>> => {
  try {
    const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findFirst({
      where: {
        kegiatanId,
        jenis: "UH_DALAM_NEGERI",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!riwayatPengajuan) {
      return {
        success: false,
        error: "Riwayat pengajuan not found",
      };
    }

    const updateRiwayatPengajuan = await dbHonorarium.riwayatPengajuan.update({
      where: {
        id: riwayatPengajuan.id,
      },
      data: {
        bendaharaId,
        ppkId,
      },
    });

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error updating bendahara and ppk",
    };
  }
};

export default updateBendaharaPpkNominatifUhDalamNegeri;
