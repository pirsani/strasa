"use server";
import { ActionResponse } from "@/actions/response";
import { SbmTaksiPlainObject } from "@/data/sbm-taksi";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import { SbmTaksi as ZSbmTaksi } from "@/zod/schemas/sbm-taksi";
import { createId } from "@paralleldrive/cuid2";
import { SbmTaksi } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
export type { SbmTaksiPlainObject } from "@/data/sbm-taksi";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getSbmTaksi = async (sbmTaksi?: string) => {
  const dataSbmTaksi = await dbHonorarium.sbmTaksi.findMany({});
  return dataSbmTaksi;
};

export const simpanDataSbmTaksi = async (
  data: ZSbmTaksi
): Promise<ActionResponse<SbmTaksi>> => {
  try {
    const sbmTaksiBaru = await dbHonorarium.sbmTaksi.create({
      data: {
        ...data,
        createdBy: "admin",
      },
    });
    revalidatePath("/data-referensi/sbm/taksi");
    return {
      success: true,
      data: sbmTaksiBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const updateDataSbmTaksi = async (
  data: ZSbmTaksi,
  id: string
): Promise<ActionResponse<SbmTaksiPlainObject>> => {
  try {
    const sbmTaksiBaru = await dbHonorarium.sbmTaksi.upsert({
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
    //const plainObject = sbmTaksiBaru as SbmTaksiPlainObject;
    const plainObject =
      convertSpecialTypesToPlain<SbmTaksiPlainObject>(sbmTaksiBaru);
    //logger.info("[PLAIN OBJECT]", plainObject);
    revalidatePath("/data-referensi/sbm/taksi");
    return {
      success: true,
      data: plainObject,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteDataSbmTaksi = async (
  id: string
): Promise<ActionResponse<SbmTaksiPlainObject>> => {
  try {
    const deleted = await dbHonorarium.sbmTaksi.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/sbm/taksi");
    const plainObject =
      convertSpecialTypesToPlain<SbmTaksiPlainObject>(deleted);
    return {
      success: true,
      data: plainObject,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        logger.error("Sbm Taksi not found");
        return {
          success: false,
          error: "Sbm Taksi not found",
          message: "Sbm Taksi not found",
        };
        break;

      case "P2003":
        logger.error("Sbm Taksi is being referenced by other data");
        return {
          success: false,
          error: "Sbm Taksi is being referenced by other data",
          message: "Sbm Taksi is being referenced by other data",
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

export const getOptionsSbmTaksi = async () => {
  const dataSbmTaksi = await dbHonorarium.sbmTaksi.findMany({
    include: {
      provinsi: true,
    },
  });
  // map dataSbmTaksi to options
  const optionsSbmTaksi = dataSbmTaksi.map((sbmTaksi) => ({
    value: sbmTaksi.id,
    label: sbmTaksi.provinsi.nama,
  }));

  return optionsSbmTaksi;
};
