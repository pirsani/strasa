"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { Materi as ZMateri } from "@/zod/schemas/materi";
import { Materi } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";

import { createId } from "@paralleldrive/cuid2";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getMateri = async (materi?: string) => {
  const dataMateri = await dbHonorarium.materi.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return dataMateri;
};

export const simpanDataMateri = async (
  data: ZMateri
): Promise<ActionResponse<Materi>> => {
  try {
    const materiBaru = await dbHonorarium.materi.create({
      data: {
        ...data,
        createdBy: "admin",
      },
    });
    revalidatePath("/data-referensi/materi");
    return {
      success: true,
      data: materiBaru,
    };
  } catch (error) {
    logger.error("error", error);
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const updateDataMateri = async (
  data: ZMateri,
  id: string
): Promise<ActionResponse<Materi>> => {
  try {
    const materiBaru = await dbHonorarium.materi.upsert({
      where: {
        id: id || createId(),
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
    revalidatePath("/data-referensi/materi");
    return {
      success: true,
      data: materiBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteDataMateri = async (
  id: string
): Promise<ActionResponse<Materi>> => {
  try {
    const deleted = await dbHonorarium.materi.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/materi");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    logger.error("error", error);
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        console.error("Materi not found");
        return {
          success: false,
          error: "Materi not found",
          message: "Materi not found",
        };
        break;

      case "P2003":
        console.error("Materi is being referenced by other data");
        return {
          success: false,
          error: "Materi is being referenced by other data",
          message: "Materi is being referenced by other data",
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

export const getOptionsMateri = async () => {
  const dataMateri = await dbHonorarium.materi.findMany({});
  // map dataMateri to options
  const optionsMateri = dataMateri.map((materi) => ({
    value: materi.id,
    label: materi.kode + "-" + materi.nama,
  }));

  return optionsMateri;
};
