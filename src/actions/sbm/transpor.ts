"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { dbHonorarium } from "@/lib/db-honorarium";
import {
  SbmTransporDalamKotaPulangPergi as ZSbmTransporDalamKotaPulangPergi,
  SbmTransporJakartaKeKotaKabSekitar as ZSbmTransporJakartaKeKotaKabSekitar,
} from "@/zod/schemas/transpor";
import { createId } from "@paralleldrive/cuid2";
import {
  Kota,
  SbmTransporDalamKotaPulangPergi,
  SbmTransporJakartaKeKotaKabSekitar,
} from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { getPrismaErrorResponse } from "../prisma-error-response";
import { ActionResponse } from "../response";

export interface SbmTransporJakartaKeKotaKabSekitarWithKota
  extends SbmTransporJakartaKeKotaKabSekitar {
  kota: Kota;
}

export const simpanDataSbmTransporDalamKotaPulangPergi = async (
  sbmTransporDalamKota: ZSbmTransporDalamKotaPulangPergi
): Promise<ActionResponse<SbmTransporDalamKotaPulangPergi>> => {
  // Simpan data sbmTransporDalamKota
  console.log(sbmTransporDalamKota);
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }
  const penggunaId = pengguna.data.penggunaId;
  try {
    const sbmTransporDalamKotaUpsert =
      await dbHonorarium.sbmTransporDalamKotaPulangPergi.upsert({
        where: { id: sbmTransporDalamKota.id || createId() },
        update: {
          tahun: sbmTransporDalamKota.tahun,
          besaran: sbmTransporDalamKota.besaran,
          updatedBy: penggunaId,
          updatedAt: new Date(),
        },
        create: {
          tahun: sbmTransporDalamKota.tahun,
          besaran: sbmTransporDalamKota.besaran,
          createdBy: penggunaId,
          createdAt: new Date(),
        },
      });
    revalidatePath("/data-referensi/sbm/transpor");
    return {
      success: true,
      data: sbmTransporDalamKotaUpsert,
    };
  } catch (error) {
    return getPrismaErrorResponse(error as Error);
  }
};

export const simpanDataSbmTransporJakartaKeKotaKabSekitar = async (
  sbmTransporJakartaKeKotaKabSekitar: ZSbmTransporJakartaKeKotaKabSekitar
): Promise<ActionResponse<SbmTransporJakartaKeKotaKabSekitar>> => {
  // Simpan data sbmTransporJakartaKeKotaKabSekitar

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }
  const penggunaId = pengguna.data.penggunaId;
  try {
    const sbmTransporJakartaKeKotaKabSekitarUpsert =
      await dbHonorarium.sbmTransporJakartaKeKotaKabSekitar.upsert({
        where: { id: sbmTransporJakartaKeKotaKabSekitar.id || createId() },
        update: {
          ...sbmTransporJakartaKeKotaKabSekitar,
          updatedBy: penggunaId,
          updatedAt: new Date(),
        },
        create: {
          ...sbmTransporJakartaKeKotaKabSekitar,
          createdBy: penggunaId,
          createdAt: new Date(),
        },
      });
    revalidatePath("/data-referensi/sbm/transpor");
    return {
      success: true,
      data: sbmTransporJakartaKeKotaKabSekitarUpsert,
    };
  } catch (error) {
    return getPrismaErrorResponse(error as Error);
  }
};

export const deleteSbmTransporDalamKotaPulangPergi = async (
  id: string
): Promise<ActionResponse<SbmTransporDalamKotaPulangPergi>> => {
  try {
    const deleted = await dbHonorarium.sbmTransporDalamKotaPulangPergi.delete({
      where: { id },
    });
    revalidatePath("/data-referensi/sbm/transpor");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    return getPrismaErrorResponse(error as Error);
  }
};

export const deleteSbmTransporJakartaKeKotaKabSekitar = async (id: string) => {
  try {
    const deleted =
      await dbHonorarium.sbmTransporJakartaKeKotaKabSekitar.delete({
        where: { id },
      });
    revalidatePath("/data-referensi/sbm/transpor");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    return getPrismaErrorResponse(error as Error);
  }
};

export default simpanDataSbmTransporDalamKotaPulangPergi;
