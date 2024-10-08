"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { Provinsi as ZProvinsi } from "@/zod/schemas/provinsi";
import { createId } from "@paralleldrive/cuid2";
import { Provinsi } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getProvinsi = async (provinsi?: string) => {
  const dataProvinsi = await dbHonorarium.provinsi.findMany({});
  return dataProvinsi;
};

export const simpanDataProvinsi = async (
  data: ZProvinsi
): Promise<ActionResponse<Provinsi>> => {
  try {
    const provinsiBaru = await dbHonorarium.provinsi.create({
      data: {
        ...data,
        id: data.kode,
        createdBy: "admin",
      },
    });
    logger.info(provinsiBaru);
    revalidatePath("/data-referensi/provinsi");
    return {
      success: true,
      data: provinsiBaru,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    if (customError.code === "P2002") {
      return {
        success: false,
        error: customError.code,
        message: "data provinsi sudah ada",
      };
    }
    return {
      success: false,
      error: "EP-0001",
      message: "Unknown error",
    };
  }
};

export const updateDataProvinsi = async (
  data: ZProvinsi,
  id: string
): Promise<ActionResponse<Provinsi>> => {
  try {
    const provinsiUpdated = await dbHonorarium.provinsi.upsert({
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
    logger.info(provinsiUpdated);
    revalidatePath("/data-referensi/provinsi");
    return {
      success: true,
      data: provinsiUpdated,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteDataProvinsi = async (
  id: string
): Promise<ActionResponse<Provinsi>> => {
  try {
    const deleted = await dbHonorarium.provinsi.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/provinsi");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        logger.error("Provinsi not found");
        return {
          success: false,
          error: "Provinsi not found",
          message: "Provinsi not found",
        };
        break;

      case "P2003":
        logger.error("Provinsi is being referenced by other data");
        return {
          success: false,
          error: "Provinsi is being referenced by other data",
          message: "Provinsi is being referenced by other data",
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

export const getOptionsProvinsi = async () => {
  const dataProvinsi = await dbHonorarium.provinsi.findMany({});
  // map dataProvinsi to options
  const optionsProvinsi = dataProvinsi.map((provinsi) => ({
    value: provinsi.id,
    label: provinsi.kode + "-" + provinsi.nama,
  }));

  return optionsProvinsi;
};
