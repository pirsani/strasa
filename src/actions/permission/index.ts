"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import {
  permissionSchema,
  Permission as ZPermission,
} from "@/zod/schemas/permission";
import { createId } from "@paralleldrive/cuid2";
import { Permission } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
import { ZodError } from "zod";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});
// pada prinsipnya, Satker anggaran adalah unit kerja dalam organisasi yang memiliki anggaran

export const getPermission = async (permission?: string) => {
  const dataPermission = await dbHonorarium.permission.findMany({});
  return dataPermission;
};

// hanya akan memberi flag isPermission pada unit kerja yang dipilih

export const deletePermission = async (
  id: string
): Promise<ActionResponse<Permission>> => {
  try {
    const deleted = await dbHonorarium.permission.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/data-referensi/permission");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const getOptionsPermission = async () => {
  const dataPermission = await dbHonorarium.permission.findMany({});
  // map dataPermission to options
  const optionsPermission = dataPermission.map((permission) => {
    const label = permission.name;
    return {
      label: label,
      value: permission.id,
    };
  });

  return optionsPermission;
};

export const simpanDataPermission = async (
  data: ZPermission
): Promise<ActionResponse<Permission>> => {
  logger.info("sebelum", data);
  try {
    const parsed = permissionSchema.parse(data);

    logger.info("parsed", parsed);
    const permissionUpsert = await dbHonorarium.permission.upsert({
      where: {
        id: parsed.id || createId(),
      },
      create: {
        ...parsed,
        createdBy: "admin",
      },
      update: {
        ...parsed,
        updatedBy: "admin",
      },
    });
    logger.info("sesudah", permissionUpsert);
    revalidatePath("/data-referensi/permission");
    return {
      success: true,
      data: permissionUpsert,
    };
  } catch (error) {
    logger.error("Error parsing form data", error);
    if (error instanceof ZodError) {
      logger.error("[ZodError]", error.errors);
    } else {
      const customError = error as CustomPrismaClientError;
      if (customError.code === "P2002") {
        return {
          success: false,
          error: customError.code,
          message: "Permission yang sama sudah ada",
        };
      }
      logger.error("[customError]", customError.code, customError.message);
    }
    return {
      success: false,
      error: "Error parsing form data",
      message: "Error parsing form data",
    };
  }
};
