"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium, Prisma } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { Kota as ZKota } from "@/zod/schemas/kota";
import { createId } from "@paralleldrive/cuid2";
import { Kota } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getKota = async (kota?: string) => {
  const dataKota = await dbHonorarium.kota.findMany({});
  return dataKota;
};

export const simpanDataKota = async (
  data: ZKota
): Promise<ActionResponse<Kota>> => {
  try {
    const kotaBaru = await dbHonorarium.kota.upsert({
      where: {
        id: data.id || createId(),
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
    logger.info(kotaBaru);
    revalidatePath("/data-referensi/kota");
    return {
      success: true,
      data: kotaBaru,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    if (customError.code === "P2002") {
      return {
        success: false,
        error: customError.code,
        message: "data kota sudah ada",
      };
    }
    return {
      success: false,
      error: "EP-0001",
      message: "Unknown error",
    };
  }
};

export const updateDataKota = async (
  data: ZKota,
  id: string
): Promise<ActionResponse<Kota>> => {
  try {
    const kotaUpdated = await dbHonorarium.kota.upsert({
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
    logger.info(kotaUpdated);
    revalidatePath("/data-referensi/kota");
    return {
      success: true,
      data: kotaUpdated,
    };
  } catch (error) {
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};

export const deleteDataKota = async (
  id: string
): Promise<ActionResponse<Kota>> => {
  try {
    const deleted = await dbHonorarium.kota.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/kota");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    const customError = error as CustomPrismaClientError;
    switch (customError.code) {
      case "P2025":
        logger.error("Kota not found");
        return {
          success: false,
          error: "Kota not found",
          message: "Kota not found",
        };
        break;

      case "P2003":
        logger.error("Kota is being referenced by other data");
        return {
          success: false,
          error: "Kota is being referenced by other data",
          message: "Kota is being referenced by other data",
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

export const getOptionsKota = async () => {
  const dataKota = await dbHonorarium.kota.findMany({
    include: {
      provinsi: true,
    },
  });
  // map dataKota to options
  const optionsKota = dataKota.map((kota) => ({
    value: kota.id,
    label: kota.nama + "-" + kota.provinsi.nama,
    provinsiId: kota.provinsiId,
    provinsiNama: kota.provinsi.nama,
  }));

  return optionsKota;
};

// 3191:31;Kepulauan Seribu ini adalah tambahan dari kota sekitar jakarta karena data di kemendagri tidak ada kota kepulauan seribu
// data Kab. Bogor juga tidak ada di data kota sekitar jakarta sehingga hanya ada Kota. Bogor
// alternatifnya adalah menambahkan data kota sekitar jakarta di db

// mending pake view aja jadi managenya di db
// jadi pake raw query
interface KotaSekitarJakarta {
  id: string;
  nama: string;
  provinsiId: string;
  provinsiNama: string;
}
export const getOptionsKotaSekitarJakarta = async () => {
  const qKotaSekitarJakarta = Prisma.sql`
  select id, nama, "provinsiId", "provinsiNama" from vkota_sekitar_jakarta
  `;

  const dataKota = await dbHonorarium.$queryRaw<KotaSekitarJakarta[]>(
    qKotaSekitarJakarta
  );
  // map dataKota to options
  const optionsKota = dataKota.map((kota) => ({
    value: kota.id,
    label: kota.nama + "-" + kota.provinsiNama,
    provinsiId: kota.provinsiId,
    provinsiNama: kota.provinsiNama,
  }));

  return optionsKota;
};
