"use server";
import { ActionResponse } from "@/actions/response";
import { auth } from "@/auth";
import { dbHonorarium } from "@/lib/db-honorarium";
import {
  pejabatPerbendaharaanSchema,
  PejabatPerbendaharaan as ZPejabatPerbendaharaan,
} from "@/zod/schemas/pejabat-perbendaharaan";
import { PejabatPerbendaharaan } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";

export const getUser = async (): Promise<ActionResponse<string>> => {
  const session = await auth();
  if (!session) {
    return {
      success: false,
      message: "Not authenticated",
      error: "Not authenticated",
    };
  }

  const user = session.user;
  const userId = user.id;
  if (!userId) {
    throw new Error("User ID is undefined");
  }
  return {
    success: true,
    message: "User authenticated",
    data: userId,
  };
};

export const deleteDataPejabatPerbendaharaan = async (
  id: string
): Promise<ActionResponse<PejabatPerbendaharaan>> => {
  const user = await getUser();
  if (!user) {
    return {
      success: false,
      message: "Not authenticated",
      error: "Not authenticated",
    };
  }

  try {
    const deleted = await dbHonorarium.pejabatPerbendaharaan.delete({
      where: {
        id,
      },
    });

    revalidatePath("/data-referensi/pejabat-perbendaharaan");
    return {
      success: true,
      message: "Berhasil menghapus pejabatPerbendaharaan",
      data: deleted,
    };
  } catch (error) {
    console.error("[error]", error);
    return {
      success: false,
      message: "Error deleting pejabatPerbendaharaan",
      error: "Error deleting pejabatPerbendaharaan",
    };
  }
};

export const getOptionsJenisJabatanPerbendaharaan = async () => {
  const dataJenisJabatanPerbendaharaan =
    await dbHonorarium.jenisJabatanPerbendaharaan.findMany({});
  // map dataJenisJabatanPerbendaharaan to options
  const optionsJenisJabatanPerbendaharaan = dataJenisJabatanPerbendaharaan.map(
    (jenis) => ({
      value: jenis.id,
      label: jenis.nama,
    })
  );

  return optionsJenisJabatanPerbendaharaan;
};

export const simpanPejabatPerbendaharaan = async (
  data: ZPejabatPerbendaharaan
): Promise<ActionResponse<PejabatPerbendaharaan>> => {
  // check user

  const session = await auth();
  if (!session) {
    return {
      success: false,
      message: "Not authenticated",
      error: "Not authenticated",
    };
  }

  const user = session.user;
  const userId = user.id;
  // Ensure userId is defined
  if (!userId) {
    throw new Error("User ID is undefined");
  }

  console.log("[data]", data);

  // step 1: validate the object using zod schema
  try {
    const validObj = pejabatPerbendaharaanSchema.parse(data);
    if (validObj) {
      // step 2: save the object to the database

      // if id is defined, update existing object

      let objReadyToSave;
      if (!validObj.id) {
        // if id is not defined, then it's a new object, set createdBy
        objReadyToSave = {
          ...validObj,
          createdBy: userId,
        };
      } else {
        // if id is defined, then it's an existing object, set updatedBy
        objReadyToSave = {
          ...validObj,
          updatedBy: userId,
          updatedAt: new Date(),
        };
      }

      objReadyToSave = {
        ...validObj,
        createdBy: userId,
      };

      let pejabatPerbendaharaan;

      console.log("objReadyToSave", objReadyToSave);
      if (objReadyToSave.id) {
        pejabatPerbendaharaan = await dbHonorarium.pejabatPerbendaharaan.upsert(
          {
            where: {
              id: objReadyToSave.id,
            },
            create: objReadyToSave,
            update: objReadyToSave,
          }
        );
      } else {
        pejabatPerbendaharaan = await dbHonorarium.pejabatPerbendaharaan.create(
          {
            data: objReadyToSave,
          }
        );
      }

      revalidatePath("/data-referensi/pejabat-perbendaharaan");
      return {
        success: true,
        message: "Berhasil menyimpan pejabatPerbendaharaan",
        data: pejabatPerbendaharaan,
      };
    }
  } catch (error) {
    console.error("[error]", error);
    return {
      success: false,
      message: "Error validating pejabatPerbendaharaan",
      error: "Error validating pejabatPerbendaharaan",
    };
  }
  return {
    success: false,
    message: "Error saving pejabatPerbendaharaan",
    error: "Error saving pejabatPerbendaharaan",
  };
};
