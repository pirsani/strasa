"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { SbmUangRepresentasi as ZSbmUangRepresentasi } from "@/zod/schemas/sbm-uang-representasi";
import { createId } from "@paralleldrive/cuid2";
import { SbmUangRepresentasi } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
import { getPrismaErrorResponse } from "../prisma-error-response";
export type { sbmUangRepresentasiWithPejabat } from "@/data/sbm-uang-representasi";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const simpanDataSbmUangRepresentasi = async (
  data: ZSbmUangRepresentasi
): Promise<ActionResponse<SbmUangRepresentasi>> => {
  try {
    const sbmUangRepresentasiBaru =
      await dbHonorarium.sbmUangRepresentasi.create({
        data: {
          ...data,
          createdBy: "admin",
        },
      });
    revalidatePath("/data-referensi/sbm/uang-representasi");
    return {
      success: true,
      data: sbmUangRepresentasiBaru,
    };
  } catch (error) {
    logger.error(error);
    return getPrismaErrorResponse(error as Error, "SBM Uang Representasi");
  }
};

export const updateDataSbmUangRepresentasi = async (
  data: ZSbmUangRepresentasi,
  id: string
): Promise<ActionResponse<SbmUangRepresentasi>> => {
  try {
    const sbmUangRepresentasiBaru =
      await dbHonorarium.sbmUangRepresentasi.upsert({
        where: {
          id: id || createId(), // fallback to create new data if id is not provided
        },
        create: {
          ...data,
          createdBy: "admin",
        },
        update: {
          ...data,
          updatedBy: "admin",
        },
      });
    revalidatePath("/data-referensi/sbmUangRepresentasi");
    return {
      success: true,
      data: sbmUangRepresentasiBaru,
    };
  } catch (error) {
    logger.error(error);
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteDataSbmUangRepresentasi = async (
  id: string
): Promise<ActionResponse<SbmUangRepresentasi>> => {
  try {
    const deleted = await dbHonorarium.sbmUangRepresentasi.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/sbm/uang-representasi");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        logger.error("Sbm Uang Representasi not found");
        return {
          success: false,
          error: "Sbm Uang Representasi not found",
          message: "Sbm Uang Representasi not found",
        };
        break;

      case "P2003":
        logger.error("Sbm Uang Representasi is being referenced by other data");
        return {
          success: false,
          error: "Sbm Uang Representasi is being referenced by other data",
          message: "Sbm Uang Representasi is being referenced by other data",
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

export const getOptionsSbmUangRepresentasi = async () => {
  const dataSbmUangRepresentasi =
    await dbHonorarium.sbmUangRepresentasi.findMany({
      include: {
        pejabat: true,
      },
    });
  // map dataSbmUangRepresentasi to options
  const optionsSbmUangRepresentasi = dataSbmUangRepresentasi.map(
    (sbmUangRepresentasi) => ({
      value: sbmUangRepresentasi.id,
      label:
        sbmUangRepresentasi.pejabat.nama +
        "-" +
        sbmUangRepresentasi.luarKota +
        "-" +
        sbmUangRepresentasi.dalamKota,
    })
  );

  return optionsSbmUangRepresentasi;
};
