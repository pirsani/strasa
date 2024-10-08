"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { Negara as ZNegara } from "@/zod/schemas/negara";
import { Negara } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";

import { createId } from "@paralleldrive/cuid2";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getNegara = async (negara?: string) => {
  const dataNegara = await dbHonorarium.negara.findMany({});
  return dataNegara;
};

export const simpanDataNegara = async (
  data: ZNegara
): Promise<ActionResponse<Negara>> => {
  try {
    const negaraBaru = await dbHonorarium.negara.create({
      data: {
        ...data,
        id: data.kodeAlpha3,
        createdBy: "admin",
      },
    });
    revalidatePath("/data-referensi/negara");
    return {
      success: true,
      data: negaraBaru,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    if (customError.code === "P2002") {
      return {
        success: false,
        error: customError.code,
        message: "data negara sudah ada",
      };
    }
    return {
      success: false,
      error: "EN-0001",
      message: "Unknown error",
    };
  }
};

export const updateDataNegara = async (
  data: ZNegara,
  id: string
): Promise<ActionResponse<Negara>> => {
  try {
    const negaraUpdated = await dbHonorarium.negara.upsert({
      where: {
        id: id || createId(),
      },
      create: {
        ...data,
        id: id,
        createdBy: "admin",
      },
      update: {
        ...data,
        updatedBy: "admin",
      },
    });
    logger.info(negaraUpdated);
    revalidatePath("/data-referensi/negara");
    return {
      success: true,
      data: negaraUpdated,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteDataNegara = async (
  id: string
): Promise<ActionResponse<Negara>> => {
  try {
    const deleted = await dbHonorarium.negara.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/negara");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        logger.error("Negara not found");
        return {
          success: false,
          error: "Negara not found",
          message: "Negara not found",
        };
        break;

      case "P2003":
        logger.error("Negara is being referenced by other data");
        return {
          success: false,
          error: "Negara is being referenced by other data",
          message: "Negara is being referenced by other data",
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

export const getOptionsNegara = async () => {
  const dataNegara = await dbHonorarium.negara.findMany({});
  // map dataNegara to options
  const optionsNegara = dataNegara.map((negara) => ({
    value: negara.id,
    label: negara.kodeAlpha3 + "-" + negara.nama,
  }));

  return optionsNegara;
};
