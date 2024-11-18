"use server";
import { getPagu, getPaguUnitKerja, PaguUnitKerja } from "@/data/pagu";
import { dbHonorarium } from "@/lib/db-honorarium";
import { Pagu as ZPagu } from "@/zod/schemas/pagu";
import { createId } from "@paralleldrive/cuid2";
import { getSessionPenggunaForAction } from "../pengguna";
import { getTahunAnggranPilihan } from "../pengguna/preference";
import { ActionResponse } from "../response";
export type { PaguUnitKerja };

export const simpanDataPagu = async (
  data: ZPagu
): Promise<ActionResponse<PaguUnitKerja>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const { id, unitKerjaId, pagu } = data;

  const satkerId = pengguna.data.satkerId;
  //const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  const tahun = await getTahunAnggranPilihan();

  const upsertPagu = await dbHonorarium.pagu.upsert({
    where: {
      id: id ?? createId(),
    },
    create: {
      unitKerjaId,
      tahun,
      pagu: pagu ?? 0,
      createdBy: penggunaId,
    },
    update: {
      pagu: pagu ?? 0,
      updatedBy: penggunaId,
      updatedAt: new Date(),
    },
  });

  const upsertedPagu = await getPaguUnitKerja(upsertPagu.id, tahun);

  if (!upsertedPagu) {
    return {
      success: false,
      error: "Pagu tidak ditemukan",
      message: "Pagu tidak ditemukan",
    };
  }

  return {
    success: true,
    data: upsertedPagu,
  };
};

export const hapusDataPagu = async (
  id: string
): Promise<ActionResponse<PaguUnitKerja>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  //const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  const tahun = await getTahunAnggranPilihan();
  const tobeDeleted = await getPagu(id);

  const deleted = await dbHonorarium.pagu.delete({
    where: {
      id,
    },
  });

  if (!deleted || !tobeDeleted) {
    return {
      success: false,
      error: "Pagu tidak ditemukan",
      message: "Pagu tidak ditemukan",
    };
  }

  return {
    success: true,
    data: tobeDeleted,
  };
};
