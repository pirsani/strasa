"use server";
import { ActionResponse } from "@/actions/response";
import { auth } from "@/auth";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { penggunaSchema, Pengguna as ZPengguna } from "@/zod/schemas/pengguna";
import { User as Pengguna } from "@prisma-honorarium/client";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { createId } from "@paralleldrive/cuid2";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

// pada prinsipnya, Satker anggaran adalah unit kerja dalam organisasi yang memiliki anggaran

export interface PenggunaWithRoles extends Omit<Pengguna, "password"> {
  userRole: UserRole[];
  organisasi: {
    id: string;
    nama: string;
    indukOrganisasi: { id: string; nama: string };
  };
}
export const getPengguna = async (pengguna?: string) => {
  const dataPengguna = await dbHonorarium.user.findMany({
    include: {
      userRole: {
        include: {
          role: true,
        },
      },
      organisasi: {
        include: {
          indukOrganisasi: true,
        },
      },
    },
  });
  return dataPengguna as PenggunaWithRoles[];
};

// hanya akan memberi flag isPengguna pada unit kerja yang dipilih

export const deletePengguna = async (
  id: string
): Promise<ActionResponse<Pengguna>> => {
  try {
    const deleted = await dbHonorarium.user.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/data-referensi/pengguna");
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

export const getOptionsPengguna = async () => {
  const dataPengguna = await dbHonorarium.user.findMany({});
  // map dataPengguna to options
  const optionsPengguna = dataPengguna.map((pengguna) => {
    const label = pengguna.name;
    return {
      label: label,
      value: pengguna.id,
    };
  });

  return optionsPengguna;
};

interface UserRole {
  roleId: string;
  userId?: string;
}
export const simpanDataPengguna = async (
  data: ZPengguna
): Promise<ActionResponse<Pengguna>> => {
  //logger.info("sebelum", data);
  try {
    const parsed = penggunaSchema.parse(data);

    // omit rePassword from the data
    delete parsed.rePassword;

    // hash the password
    if (parsed.password) {
      // bcrypt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(parsed.password, salt);
      parsed.password = hashedPassword;
    } else {
      delete parsed.password;
    }

    const { roles, ...userWithoutRoles } = parsed;
    // create array role object
    const objRoles: UserRole[] = (roles ?? []).map((roleId) => {
      return {
        roleId,
      };
    });

    let rolesToRemove: UserRole[] = [];
    let rolesToAdd: UserRole[] = [];

    if (data.id) {
      // Fetch existing roles
      const existingRoles = await dbHonorarium.userRole.findMany({
        where: {
          userId: data.id,
        },
      });
      // Compare existing roles with new roles
      rolesToRemove = existingRoles.filter(
        (er) => !objRoles.some((r) => r.roleId === er.roleId)
      );
      rolesToAdd = objRoles.filter(
        (r) => !existingRoles.some((er) => er.roleId === r.roleId)
      );
    } else {
      rolesToAdd = objRoles;
    }

    logger.info("parsed", userWithoutRoles);
    const penggunaUpsert = await dbHonorarium.user.upsert({
      where: {
        id: userWithoutRoles.id || createId(),
      },
      create: {
        ...userWithoutRoles,
        createdBy: "admin",
        userRole: {
          createMany: {
            data: rolesToAdd,
          },
        },
      },
      update: {
        ...userWithoutRoles,
        updatedBy: "admin",
        userRole: {
          deleteMany: {
            roleId: {
              in: rolesToRemove.map((r) => r.roleId),
            },
          },
          createMany: {
            data: rolesToAdd,
          },
        },
      },
    });
    logger.info("sesudah", penggunaUpsert);
    revalidatePath("/data-referensi/pengguna");
    return {
      success: true,
      data: penggunaUpsert,
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
          message: "Pengguna yang sama sudah ada",
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

export const getSessionPengguna = async () => {
  const session = await auth();
  logger.info("session", session);
  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      message: "Not authenticated",
      error: "Not authenticated",
    };
  }

  return {
    success: true,
    data: session.user,
  };
};

interface SessionPenggunaForActionResponse {
  satkerId: string;
  unitKerjaId: string;
  penggunaId: string;
}
export const getSessionPenggunaForAction = async (): Promise<
  ActionResponse<SessionPenggunaForActionResponse>
> => {
  const pengguna = await getSessionPengguna();
  logger.info("Pengguna", pengguna);
  if (!pengguna.success || !pengguna.data || !pengguna.data.id) {
    return {
      success: false,
      error: "E-UAuth-01",
      message: "User not found",
    };
  }

  if (!pengguna.data?.satkerId || !pengguna.data?.unitKerjaId) {
    return {
      success: false,
      error: "E-UORG-01",
      message: "User tidak mempunyai satkerId atau unitKerjaId",
    };
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.id;
  return {
    success: true,
    data: {
      satkerId,
      unitKerjaId,
      penggunaId,
    },
  };
};
