"use server";
import { ActionResponse, getUserId } from "@/actions";
import { hasPermission } from "@/data/user";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import {
  NarasumberWithoutFile,
  narasumberWithoutFileSchema,
} from "@/zod/schemas/narasumber";
import { Narasumber } from "@prisma-honorarium/client";
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

export const simpanNarasumber = async (
  data: NarasumberWithoutFile,
  existingId?: string
): Promise<ActionResponse<Narasumber>> => {
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
  const permitted = await hasPermission(userId, "narasumber:create");
  logger.info("[permitted]", permitted);

  // if existingId is not provided, then it's should be a new data
  // but because we are using upsert, we need to prevent user to insert new data with existing id because it will update the existing data, may be user not aware that the data is already exist so we will throw an error

  if (!existingId) {
    // check if the data already exist
    const isExist = await dbHonorarium.narasumber.findFirst({
      where: {
        id: data.id,
      },
    });
    if (isExist) {
      return {
        success: false,
        error: "E-NUUI-001", // error Narasumber, prevent user unintended try to update
        message: "Narasumber already exist, please use update instead",
      };
    }
  }

  let dataparsed;
  try {
    dataparsed = narasumberWithoutFileSchema.parse(data);

    // Use type assertion to treat the property as optional
    delete dataparsed.dokumenPeryataanRekeningBerbedaCuid;

    const dokumenPeryataanRekeningBerbeda = await saveFileToFinalFolder(data);

    const narasumber = dataparsed as Narasumber;
    if (dokumenPeryataanRekeningBerbeda) {
      narasumber.dokumenPeryataanRekeningBerbeda =
        dokumenPeryataanRekeningBerbeda;
    }

    const saved = await saveDataToDatabase(narasumber, pengguna);
    revalidatePath("/data-referensi/narasumber");
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

export const updateNarasumber = async (
  data: NarasumberWithoutFile,
  id: string
): Promise<ActionResponse<Narasumber>> => {
  // step 1: parse the form data
  data.id = id;
  return simpanNarasumber(data);
};

const saveDataToDatabase = async (data: Narasumber, byUser: string) => {
  // const dataCreatedBy = {
  //   ...data,
  //   //dokumenPeryataanRekeningBerbeda: data.dokumenPeryataanRekeningBerbeda?.name,
  //   createdBy,
  // };
  // Save data to database
  try {
    //const result = await dbHonorarium.$transaction(async (prisma) => {
    const newNarasumber = await dbHonorarium.narasumber.upsert({
      where: {
        id: data.id || createId(),
      },
      update: { ...data, updatedBy: byUser },
      create: { ...data, createdBy: byUser },
    });
    // Save data to database
    return newNarasumber;
    // });
    // return result;
  } catch (error) {
    const e = error as CustomPrismaClientError;
    if (e.code === "P2002") {
      logger.info("There is a unique constraint violation");
      throw new Error("Narasumber dengan NIK yang sama sudah ada");
    }
    logger.error("Error saving data to database:", e);
    throw new Error(e.message);
  }
};

// pinda file dari temp ke final folder menurut NIK narasumber
const saveFileToFinalFolder = async (data: NarasumberWithoutFile) => {
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
      "narasumber",
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

export const deleteNarasumber = async (
  id: string
): Promise<ActionResponse<Narasumber>> => {
  try {
    const deleted = await dbHonorarium.narasumber.delete({
      where: {
        id,
      },
    });
    revalidatePath("/data-referensi/narasumber");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    const e = error as CustomPrismaClientError;
    switch (e.code) {
      case "P2025":
        logger.error("Narasumber not found");
        return {
          success: false,
          error: "Narasumber not found",
          message: "Narasumber not found",
        };
        break;

      case "P2003":
        logger.error("Narasumber is being referenced by other data");
        return {
          success: false,
          error: "Narasumber is being referenced by other data",
          message: "Narasumber is being referenced by other data",
        };
        break;

      default:
        break;
    }

    logger.error("Error deleting narasumber:", error);
    return {
      success: false,
      error: "Error deleting narasumber",
      message: e.code,
    };
  }
};

export default simpanNarasumber;
