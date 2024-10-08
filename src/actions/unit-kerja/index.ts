"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { UnitKerja as ZUnitKerja } from "@/zod/schemas/unit-kerja";
import { createId } from "@paralleldrive/cuid2";
import { Organisasi as UnitKerja } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";

// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export interface UnitKerjaWithInduk extends UnitKerja {
  indukOrganisasi: UnitKerja | null;
}

export const getUnitKerja = async (unitKerja?: string) => {
  const dataUnitKerja = await dbHonorarium.organisasi.findMany({
    include: {
      indukOrganisasi: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return dataUnitKerja;
};

export const simpanDataUnitKerja = async (
  data: ZUnitKerja
): Promise<ActionResponse<UnitKerja>> => {
  try {
    const unitKerjaBaru = await dbHonorarium.organisasi.upsert({
      where: {
        id: data.id || createId(), // fallback to create new data if id is not provided
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
    revalidatePath("/data-referensi/unit-kerja");
    return {
      success: true,
      data: unitKerjaBaru,
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

export const updateDataUnitKerja = async (
  data: ZUnitKerja,
  id: string
): Promise<ActionResponse<UnitKerja>> => {
  try {
    const unitKerjaBaru = await dbHonorarium.organisasi.upsert({
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
    revalidatePath("/data-referensi/unit-kerja");
    return {
      success: true,
      data: unitKerjaBaru,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteDataUnitKerja = async (
  id: string
): Promise<ActionResponse<UnitKerja>> => {
  try {
    const deleted = await dbHonorarium.organisasi.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/unit-kerja");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        logger.error("UnitKerja not found");
        return {
          success: false,
          error: "UnitKerja not found",
          message: "UnitKerja not found",
        };
        break;

      case "P2003":
        logger.error("UnitKerja is being referenced by other data");
        return {
          success: false,
          error: "UnitKerja is being referenced by other data",
          message: "UnitKerja is being referenced by other data",
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

export const getOptionsUnitKerja = async () => {
  const dataUnitKerja = await dbHonorarium.organisasi.findMany({
    include: {
      indukOrganisasi: true,
    },
  });
  // map dataUnitKerja to options
  const optionsUnitKerja = dataUnitKerja.map((unitKerja) => {
    let label = unitKerja.nama;
    if (unitKerja.indukOrganisasi) {
      label = `${unitKerja.nama} - ${unitKerja.indukOrganisasi.nama}`;
    }
    return {
      label: label,
      value: unitKerja.id,
    };
  });

  return optionsUnitKerja;
};
