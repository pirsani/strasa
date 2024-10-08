"use server";
import { ActionResponse } from "@/actions/response";
import { SbmUhDalamNegeriPlainObject } from "@/data/sbm-uh-dalam-negeri";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import { SbmUhDalamNegeri as ZSbmUhDalamNegeri } from "@/zod/schemas/sbm-uh-dalam-negeri";
import { createId } from "@paralleldrive/cuid2";
import { SbmUhDalamNegeri } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
export type { SbmUhDalamNegeriPlainObject } from "@/data/sbm-uh-dalam-negeri";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getSbmUhDalamNegeri = async (sbmUhDalamNegeri?: string) => {
  const dataSbmUhDalamNegeri = await dbHonorarium.sbmUhDalamNegeri.findMany({});
  return dataSbmUhDalamNegeri;
};

export const simpanDataSbmUhDalamNegeri = async (
  data: ZSbmUhDalamNegeri
): Promise<ActionResponse<SbmUhDalamNegeri>> => {
  try {
    const sbmUhDalamNegeriBaru = await dbHonorarium.sbmUhDalamNegeri.create({
      data: {
        ...data,
        createdBy: "admin",
      },
    });
    revalidatePath("/data-referensi/sbm/uh-dalam-negeri");
    return {
      success: true,
      data: sbmUhDalamNegeriBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const updateDataSbmUhDalamNegeri = async (
  data: ZSbmUhDalamNegeri,
  id: string
): Promise<ActionResponse<SbmUhDalamNegeriPlainObject>> => {
  try {
    const sbmUhDalamNegeriBaru = await dbHonorarium.sbmUhDalamNegeri.upsert({
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
    //const plainObject = sbmUhDalamNegeriBaru as SbmUhDalamNegeriPlainObject;
    const plainObject =
      convertSpecialTypesToPlain<SbmUhDalamNegeriPlainObject>(
        sbmUhDalamNegeriBaru
      );
    //logger.info("[PLAIN OBJECT]", plainObject);
    revalidatePath("/data-referensi/sbm/uh-dalam-negeri");
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

export const deleteDataSbmUhDalamNegeri = async (
  id: string
): Promise<ActionResponse<SbmUhDalamNegeriPlainObject>> => {
  try {
    const deleted = await dbHonorarium.sbmUhDalamNegeri.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/sbm/uh-dalam-negeri");
    const plainObject =
      convertSpecialTypesToPlain<SbmUhDalamNegeriPlainObject>(deleted);
    return {
      success: true,
      data: plainObject,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        logger.error("Sbm UHDalam Negeri not found");
        return {
          success: false,
          error: "Sbm UHDalam Negeri not found",
          message: "Sbm UHDalam Negeri not found",
        };
        break;

      case "P2003":
        logger.error("Sbm UHDalam Negeri is being referenced by other data");
        return {
          success: false,
          error: "Sbm UHDalam Negeri is being referenced by other data",
          message: "Sbm UHDalam Negeri is being referenced by other data",
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

export const getOptionsSbmUhDalamNegeri = async () => {
  const dataSbmUhDalamNegeri = await dbHonorarium.sbmUhDalamNegeri.findMany({
    include: {
      provinsi: true,
    },
  });
  // map dataSbmUhDalamNegeri to options
  const optionsSbmUhDalamNegeri = dataSbmUhDalamNegeri.map(
    (sbmUhDalamNegeri) => ({
      value: sbmUhDalamNegeri.id,
      label: sbmUhDalamNegeri.provinsi.nama,
    })
  );

  return optionsSbmUhDalamNegeri;
};
