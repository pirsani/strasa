"use server";
import { ActionResponse, getUserId } from "@/actions";
import { hasPermission } from "@/data/user";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import {
  PesertaWithoutFile,
  pesertaWithoutFileSchema,
} from "@/zod/schemas/peserta";
import { Peserta } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";

import { getSessionPengguna } from "@/actions/pengguna/session";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { createId } from "@paralleldrive/cuid2";
import fse from "fs-extra";
import path from "path";
import { Logger } from "tslog";
import { moveFileToFinalFolder } from "../file";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const simpanPeserta = async (
  data: PesertaWithoutFile,
  existingId?: string
): Promise<ActionResponse<Peserta>> => {
  const sessionPengguna = await getSessionPengguna();
  if (
    !sessionPengguna ||
    !sessionPengguna?.data ||
    !sessionPengguna?.data?.id
  ) {
    return {
      success: false,
      error: "Unauthorized",
      message: "User is not authenticated",
    };
  }

  const pengguna = sessionPengguna.data.id;

  const userId = await getUserId();
  if (!userId) {
    return {
      success: false,
      error: "Unauthorized",
      message: "User is not authenticated",
    };
  }
  const permitted = await hasPermission(userId, "peserta:create");
  logger.info("[permitted]", permitted);

  // if existingId is not provided, then it's should be a new data
  // but because we are using upsert, we need to prevent user to insert new data with existing id because it will update the existing data, may be user not aware that the data is already exist so we will throw an error

  if (!existingId) {
    // check if the data already exist
    const isExist = await dbHonorarium.peserta.findFirst({
      where: {
        id: data.id,
      },
    });
    if (isExist) {
      return {
        success: false,
        error: "E-NUUI-001", // error Peserta, prevent user unintended try to update
        message: "Peserta already exist, please use update instead",
      };
    }
  }

  let dataparsed;
  try {
    dataparsed = pesertaWithoutFileSchema.parse(data);

    // Use type assertion to treat the property as optional
    delete dataparsed.dokumenPeryataanRekeningBerbedaCuid;

    const dokumenPeryataanRekeningBerbeda = await saveFileToFinalFolder(data);

    const peserta = dataparsed as Peserta;
    if (dokumenPeryataanRekeningBerbeda) {
      peserta.dokumenPeryataanRekeningBerbeda = dokumenPeryataanRekeningBerbeda;
    }

    peserta.NIK = peserta.id; // force NIK to be the same as id
    const saved = await saveDataToDatabase(peserta, pengguna);
    revalidatePath("/data-referensi/peserta");
    return {
      success: true,
      data: saved,
    };
  } catch (error) {
    console.error("Error parsing form data:", error);
    return {
      success: false,
      error: "Error parsing form data",
      message: "Error parsing form data",
    };
  }
  return {
    success: false,
    error: "Not implemented",
  };
};

export const updatePeserta = async (
  data: PesertaWithoutFile,
  id: string
): Promise<ActionResponse<Peserta>> => {
  // step 1: parse the form data
  data.id = id;
  return simpanPeserta(data);
};

const saveDataToDatabase = async (data: Peserta, byUser: string) => {
  console.log("saveDataToDatabase", data);
  // const dataCreatedBy = {
  //   ...data,
  //   //dokumenPeryataanRekeningBerbeda: data.dokumenPeryataanRekeningBerbeda?.name,
  //   createdBy,
  // };
  // Save data to database
  try {
    //const result = await dbHonorarium.$transaction(async (prisma) => {
    const newPeserta = await dbHonorarium.peserta.upsert({
      where: {
        id: data.id || createId(),
      },
      update: {
        ...data,
        pangkatGolonganId: data.pangkatGolonganId || null,
        eselon: data.eselon?.toString() || null,
        updatedBy: byUser,
      },
      create: {
        ...data,
        pangkatGolonganId: data.pangkatGolonganId || null,
        eselon: data.eselon?.toString() || null,
        createdBy: byUser,
      },
    });
    // Save data to database
    return newPeserta;
    // });
    // return result;
  } catch (error) {
    const e = error as CustomPrismaClientError;
    if (e.code === "P2002") {
      logger.info("There is a unique constraint violation");
      throw new Error("Peserta dengan NIK yang sama sudah ada");
    }
    logger.error("Error saving data to database:", e);
    throw new Error(e.message);
  }
};

// pinda file dari temp ke final folder menurut NIK peserta
const saveFileToFinalFolder = async (data: PesertaWithoutFile) => {
  console.log(
    "dokumenPeryataanRekeningBerbedaCuid",
    data.dokumenPeryataanRekeningBerbedaCuid
  );
  if (!data.dokumenPeryataanRekeningBerbedaCuid) {
    return null;
  }
  try {
    // Save the file to the final folder
    const uploadedFile = await dbHonorarium.uploadedFile.findUnique({
      where: {
        id: data.dokumenPeryataanRekeningBerbedaCuid,
      },
    });
    if (!uploadedFile) {
      logger.warn(
        "There is no file not found in log uploaded file, ignore if this is a existing data"
      );
      return null;
    }

    const finalPathFile = path.posix.join(
      BASE_PATH_UPLOAD,
      "peserta",
      data.id,
      data.dokumenPeryataanRekeningBerbedaCuid
    );
    const tempPathFile = path.posix.join(
      BASE_PATH_UPLOAD,
      "temp",
      data.dokumenPeryataanRekeningBerbedaCuid
    );
    const resolvedPathFile = path.resolve(finalPathFile);
    const resolvedTempPathFile = path.resolve(tempPathFile);

    // check if temp file exists
    const fileExists = await fse.pathExists(resolvedTempPathFile);
    if (!fileExists) {
      logger.error(
        "File not found in temp folder, skipping moving file to final folder"
      );
      return;
    }

    await moveFileToFinalFolder(resolvedTempPathFile, resolvedPathFile);

    const filePathRelative = path.posix.relative(
      BASE_PATH_UPLOAD,
      finalPathFile
    );

    // Move the file to the final folder
    // const finalPath = await moveFileToFinalFolder(uploadedFile);
    // return finalPath;
    return filePathRelative;
  } catch (error) {
    logger.error("Error moving file:", error);
    throw new Error("Error moving file");
  }
};

const logUploadedFile = async (
  id: string,
  filename: string,
  filePath: string,
  fileHash: string,
  mimeType: string,
  createdBy: string
) => {
  // Save the file path to the database
  const uploadedFile = await dbHonorarium.uploadedFile.create({
    data: {
      id,
      originalFilename: filename,
      filePath,
      hash: fileHash,
      mimeType,
      createdBy,
      createdAt: new Date(),
    },
  });
  return uploadedFile;
};

export const deletePeserta = async (
  id: string
): Promise<ActionResponse<Peserta>> => {
  try {
    const deleted = await dbHonorarium.peserta.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/peserta");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    const e = error as CustomPrismaClientError;
    switch (e.code) {
      case "P2025":
        logger.error("Peserta not found");
        return {
          success: false,
          error: "Peserta not found",
          message: "Peserta not found",
        };
        break;

      case "P2003":
        logger.error("Peserta is being referenced by other data");
        return {
          success: false,
          error: "Peserta is being referenced by other data",
          message: "Peserta is being referenced by other data",
        };
        break;

      default:
        break;
    }

    logger.error("Error deleting peserta:", error);
    return {
      success: false,
      error: "Error deleting peserta",
      message: e.code,
    };
  }
};

export default simpanPeserta;
