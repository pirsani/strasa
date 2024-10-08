"use server";
import { ActionResponse } from "@/actions/response";
import { SbmUhLuarNegeriPlainObject } from "@/data/sbm-uh-luar-negeri";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import { SbmUhLuarNegeri as ZSbmUhLuarNegeri } from "@/zod/schemas/sbm-uh-luar-negeri";
import { createId } from "@paralleldrive/cuid2";
import { SbmUhLuarNegeri } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
export type { SbmUhLuarNegeriPlainObject } from "@/data/sbm-uh-luar-negeri";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getSbmUhLuarNegeri = async (sbmUhLuarNegeri?: string) => {
  const dataSbmUhLuarNegeri = await dbHonorarium.sbmUhLuarNegeri.findMany({});
  return dataSbmUhLuarNegeri;
};

export const simpanDataSbmUhLuarNegeri = async (
  data: ZSbmUhLuarNegeri
): Promise<ActionResponse<SbmUhLuarNegeri>> => {
  try {
    const sbmUhLuarNegeriBaru = await dbHonorarium.sbmUhLuarNegeri.create({
      data: {
        ...data,
        createdBy: "admin",
      },
    });
    revalidatePath("/data-referensi/sbm/uh-luar-negeri");
    return {
      success: true,
      data: sbmUhLuarNegeriBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const updateDataSbmUhLuarNegeri = async (
  data: ZSbmUhLuarNegeri,
  id: string
): Promise<ActionResponse<SbmUhLuarNegeriPlainObject>> => {
  try {
    const sbmUhLuarNegeriBaru = await dbHonorarium.sbmUhLuarNegeri.upsert({
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
    //const plainObject = sbmUhLuarNegeriBaru as SbmUhLuarNegeriPlainObject;
    const plainObject =
      convertSpecialTypesToPlain<SbmUhLuarNegeriPlainObject>(
        sbmUhLuarNegeriBaru
      );
    //logger.info("[PLAIN OBJECT]", plainObject);
    revalidatePath("/data-referensi/sbm/uh-luar-negeri");
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

export const deleteDataSbmUhLuarNegeri = async (
  id: string
): Promise<ActionResponse<SbmUhLuarNegeriPlainObject>> => {
  try {
    const deleted = await dbHonorarium.sbmUhLuarNegeri.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/sbm/uh-luar-negeri");
    const plainObject =
      convertSpecialTypesToPlain<SbmUhLuarNegeriPlainObject>(deleted);
    return {
      success: true,
      data: plainObject,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        logger.error("Sbm UHLuar Negeri not found");
        return {
          success: false,
          error: "Sbm UHLuar Negeri not found",
          message: "Sbm UHLuar Negeri not found",
        };
        break;

      case "P2003":
        logger.error("Sbm UHLuar Negeri is being referenced by other data");
        return {
          success: false,
          error: "Sbm UHLuar Negeri is being referenced by other data",
          message: "Sbm UHLuar Negeri is being referenced by other data",
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

export const getOptionsSbmUhLuarNegeri = async () => {
  const dataSbmUhLuarNegeri = await dbHonorarium.sbmUhLuarNegeri.findMany({
    include: {
      negara: true,
    },
  });
  // map dataSbmUhLuarNegeri to options
  const optionsSbmUhLuarNegeri = dataSbmUhLuarNegeri.map((sbmUhLuarNegeri) => ({
    value: sbmUhLuarNegeri.id,
    label: sbmUhLuarNegeri.negara.nama,
  }));

  return optionsSbmUhLuarNegeri;
};
