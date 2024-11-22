"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { getSp2d, getSp2dUnitKerja, Sp2dUnitKerja } from "@/data/sp2d";
import { dbHonorarium } from "@/lib/db-honorarium";
import { Sp2d as ZSp2d } from "@/zod/schemas/sp2d";
import { createId } from "@paralleldrive/cuid2";
import { getTahunAnggranPilihan } from "../pengguna/preference";
import { getPrismaErrorResponse } from "../prisma-error-response";
import { ActionResponse } from "../response";
export type { Sp2dUnitKerja };

export const simpanDataSp2d = async (
  data: ZSp2d
): Promise<ActionResponse<Sp2dUnitKerja>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const {
    id,
    nomor,
    tanggal,
    unitKerjaId,
    jumlahDiminta,
    jumlahPotongan,
    jumlahDibayar,
  } = data;

  const satkerId = pengguna.data.satkerId;
  //const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  const tahun = await getTahunAnggranPilihan();

  try {
    const upsertSp2d = await dbHonorarium.sp2d.upsert({
      where: {
        id: id ?? createId(),
      },
      create: {
        unitKerjaId,
        nomor: nomor.trim(),
        tanggal,
        jumlahDibayar: jumlahDibayar ?? 0,
        createdBy: penggunaId,
      },
      update: {
        unitKerjaId,
        nomor: nomor.trim(),
        tanggal,
        jumlahDibayar: jumlahDibayar ?? 0,
        updatedBy: penggunaId,
        updatedAt: new Date(),
      },
    });
    const upsertedSp2d = await getSp2dUnitKerja(upsertSp2d.id, tahun);

    if (!upsertedSp2d) {
      return {
        success: false,
        error: "Sp2d tidak ditemukan",
        message: "Sp2d tidak ditemukan",
      };
    }
    return {
      success: true,
      data: upsertedSp2d,
    };
  } catch (error) {
    console.error("Error simpanDataSp2d:", error);
    return getPrismaErrorResponse(error as Error);
  }
};

export const hapusDataSp2d = async (
  id: string
): Promise<ActionResponse<Sp2dUnitKerja>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  //const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  const tahun = await getTahunAnggranPilihan();
  const tobeDeleted = await getSp2d(id);

  const deleted = await dbHonorarium.sp2d.delete({
    where: {
      id,
    },
  });

  if (!deleted || !tobeDeleted) {
    return {
      success: false,
      error: "Sp2d tidak ditemukan",
      message: "Sp2d tidak ditemukan",
    };
  }

  return {
    success: true,
    data: tobeDeleted,
  };
};
