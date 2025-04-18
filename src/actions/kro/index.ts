"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { Kro as ZKro } from "@/zod/schemas/kro";
import { createId } from "@paralleldrive/cuid2";
import { Kro } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getKro = async (kro?: string) => {
  const dataKro = await dbHonorarium.kro.findMany({});
  return dataKro;
};

export const simpanDataKro = async (
  data: ZKro
): Promise<ActionResponse<Kro>> => {
  try {
    const pengguna = await getSessionPenggunaForAction();
    if (!pengguna.success) {
      return pengguna;
    }

    const satkerId = pengguna.data.satkerId;
    // const unitKerjaId = pengguna.data.unitKerjaId;
    const penggunaId = pengguna.data.penggunaId;

    const kroBaru = await dbHonorarium.kro.upsert({
      where: {
        id: data.id || createId(),
        satkerId,
      },
      create: {
        ...data,
        satkerId,
        createdBy: penggunaId,
      },
      update: {
        ...data,
        updatedBy: penggunaId,
      },
    });
    revalidatePath("/data-referensi/kro");
    return {
      success: true,
      data: kroBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteDataKro = async (
  id: string
): Promise<ActionResponse<Kro>> => {
  try {
    const pengguna = await getSessionPenggunaForAction();
    if (!pengguna.success) {
      return pengguna;
    }

    const satkerId = pengguna.data.satkerId;
    // const unitKerjaId = pengguna.data.unitKerjaId;
    // const penggunaId = pengguna.data.penggunaId;

    const deleted = await dbHonorarium.kro.delete({
      where: {
        id,
        satkerId,
      },
    });
    revalidatePath("/data-referensi/kro");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    logger.error("error", error);
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        logger.error("Kro not found");
        return {
          success: false,
          error: "Kro not found",
          message: "Kro not found",
        };
        break;

      case "P2003":
        logger.error("Kro is being referenced by other data");
        return {
          success: false,
          error: "Kro is being referenced by other data",
          message: "Kro is being referenced by other data",
        };
        break;

      default:
        break;
    }
    return {
      success: false,
      error: customError.code,
      message: customError.message,
    };
  }
};

export const getOptionsKodeKro = async () => {
  const dataKro = await dbHonorarium.kro.findMany({});
  // map dataKro to options
  const optionsKro = dataKro.map((kro) => ({
    value: kro.kode,
    label: kro.kode + "-" + kro.nama,
  }));

  return optionsKro;
};

export const getOptionsKro = async () => {
  const dataKro = await dbHonorarium.kro.findMany({});
  // map dataKro to options
  const optionsKro = dataKro.map((kro) => ({
    value: kro.id,
    label: kro.kode + "-" + kro.nama,
  }));

  return optionsKro;
};
