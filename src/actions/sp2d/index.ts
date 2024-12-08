"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { getPaguUnitKerja } from "@/data/pagu";
import { getSp2d, getSumSp2dByUnitKerja, Sp2dUnitKerja } from "@/data/sp2d";
import { dbHonorarium } from "@/lib/db-honorarium";
import { Sp2d as ZSp2d } from "@/zod/schemas/sp2d";
import { createId } from "@paralleldrive/cuid2";
import { Logger } from "tslog";
import { getTahunAnggranPilihan } from "../pengguna/preference";
import { getPrismaErrorResponse } from "../prisma-error-response";
import { ActionResponse } from "../response";
export type { Sp2dUnitKerja };

const logger = new Logger({
  name: "actions/sp2d",
  type: "pretty",
  hideLogPositionForProduction: true,
});

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
    // get current sum sp2d

    const sumSp2d = await getSumSp2dByUnitKerja(unitKerjaId, tahun);
    console.debug("sumSp2d", sumSp2d);

    const pagu = await getPaguUnitKerja(unitKerjaId, tahun);

    if (!pagu) {
      logger.debug("Pagu tidak ditemukan");
      return {
        success: false,
        error: "E-SDSP-001",
        message: "Pagu tidak ditemukan",
      };
    }

    const totalSp2d =
      BigInt(sumSp2d._sum.jumlahDibayar ?? 0) + (jumlahDibayar ?? 0n);

    if (totalSp2d > pagu.pagu) {
      return {
        success: false,
        error: "E-SDSP-002",
        message: "Jumlah sp2d melebihi pagu",
      };
    }

    console.log("sumSp2d", sumSp2d);

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

    const upsertedSp2d = await getSp2d(upsertSp2d.id);

    if (!upsertedSp2d) {
      return {
        success: false,
        error: "E-SDSP-003",
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
