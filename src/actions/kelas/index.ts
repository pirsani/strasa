"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { Kelas as ZKelas } from "@/zod/schemas/kelas";
import { createId } from "@paralleldrive/cuid2";
import { Kelas } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export interface kelasWithKegiatan extends Kelas {
  kegiatan: {
    id: string;
    nama: string;
  };
}
export const getKelas = async (kelas?: string) => {
  const dataKelas = await dbHonorarium.kelas.findMany({
    include: {
      kegiatan: true,
    },
  });
  return dataKelas;
};

export const simpanDataKelas = async (
  data: ZKelas
): Promise<ActionResponse<Kelas>> => {
  try {
    const kelasBaru = await dbHonorarium.kelas.create({
      data: {
        ...data,
        createdBy: "admin",
      },
    });
    revalidatePath("/data-referensi/kelas");
    return {
      success: true,
      data: kelasBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const updateDataKelas = async (
  data: ZKelas,
  id: string
): Promise<ActionResponse<Kelas>> => {
  try {
    const kelasBaru = await dbHonorarium.kelas.upsert({
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
    revalidatePath("/data-referensi/kelas");
    return {
      success: true,
      data: kelasBaru,
    };
  } catch (error) {
    logger.error("updateDataKelas error:", error);
    return {
      success: false,
      error: "E-KU-003",
      message: "Not implemented",
    };
  }
};

export const deleteDataKelas = async (
  id: string
): Promise<ActionResponse<Kelas>> => {
  try {
    const deleted = await dbHonorarium.kelas.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/kelas");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    logger.error("error", error);
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        logger.error("Kelas not found");
        return {
          success: false,
          error: "Kelas not found",
          message: "Kelas not found",
        };
        break;

      case "P2003":
        logger.error("Kelas is being referenced by other data");
        return {
          success: false,
          error: "Kelas is being referenced by other data",
          message: "Kelas is being referenced by other data",
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

export const getOptionsKelas = async () => {
  const dataKelas = await dbHonorarium.kelas.findMany({});
  // map dataKelas to options
  const optionsKelas = dataKelas.map((kelas) => ({
    value: kelas.id,
    label: kelas.kode + "-" + kelas.nama,
  }));

  return optionsKelas;
};
