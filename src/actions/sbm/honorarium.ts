"use server";
import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { ActionResponse } from "@/actions/response";
import { SbmHonorariumPlainObject } from "@/data/sbm-honorarium";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import { SbmHonorarium as ZSbmHonorarium } from "@/zod/schemas/sbm-honorarium";
import { createId } from "@paralleldrive/cuid2";
import { SbmHonorarium } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
export type { SbmHonorariumPlainObject } from "@/data/sbm-honorarium";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getSbmHonorarium = async (sbmHonorarium?: string) => {
  const tahunAnggaran = await getTahunAnggranPilihan();
  const dataSbmHonorarium = await dbHonorarium.sbmHonorarium.findMany({
    where: {
      tahun: tahunAnggaran,
    },
  });
  return dataSbmHonorarium;
};

export const simpanDataSbmHonorarium = async (
  data: ZSbmHonorarium
): Promise<ActionResponse<SbmHonorarium>> => {
  try {
    const sbmHonorariumBaru = await dbHonorarium.sbmHonorarium.create({
      data: {
        ...data,
        createdBy: "admin",
      },
    });
    revalidatePath("/data-referensi/sbm/honorarium");
    return {
      success: true,
      data: sbmHonorariumBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const updateDataSbmHonorarium = async (
  data: ZSbmHonorarium,
  id: string
): Promise<ActionResponse<SbmHonorariumPlainObject>> => {
  try {
    const sbmHonorariumBaru = await dbHonorarium.sbmHonorarium.upsert({
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
    //const plainObject = sbmHonorariumBaru as SbmHonorariumPlainObject;
    const plainObject =
      convertSpecialTypesToPlain<SbmHonorariumPlainObject>(sbmHonorariumBaru);
    //logger.info("[PLAIN OBJECT]", plainObject);
    revalidatePath("/data-referensi/sbm/honorarium");
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

export const deleteDataSbmHonorarium = async (
  id: string
): Promise<ActionResponse<SbmHonorariumPlainObject>> => {
  try {
    const deleted = await dbHonorarium.sbmHonorarium.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/sbm/honorarium");
    const plainObject =
      convertSpecialTypesToPlain<SbmHonorariumPlainObject>(deleted);
    return {
      success: true,
      data: plainObject,
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

export const getOptionsSbmHonorarium = async () => {
  const dataSbmHonorarium = await dbHonorarium.sbmHonorarium.findMany({});
  // map dataSbmHonorarium to options
  const optionsSbmHonorarium = dataSbmHonorarium.map((sbmHonorarium) => ({
    value: sbmHonorarium.id,
    label: sbmHonorarium.jenis + "-" + sbmHonorarium.uraian,
  }));

  return optionsSbmHonorarium;
};
