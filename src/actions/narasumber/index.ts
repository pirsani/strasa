"use server";
import { ActionResponse, getUserId } from "@/actions";
import { hasPermission } from "@/data/user";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import saveFile from "@/utils/file-operations/save";
import {
  narasumberSchema,
  Narasumber as ZNarasumber,
} from "@/zod/schemas/narasumber";
import { Narasumber } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { extname, join } from "path";

import { createId } from "@paralleldrive/cuid2";
import { Logger } from "tslog";
import { getSessionPengguna } from "../pengguna";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const simpanNarasumber = async (
  formData: FormData
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

  // ini bikin error ntr harus dicek lagi
  //const obj = formDataToObject(formData);

  const formDataObj: any = {};
  formData.forEach((value, key) => {
    formDataObj[key] = value;
  });
  //console.log("formDataObj", formDataObj);

  let dataparsed;
  try {
    dataparsed = narasumberSchema.parse(formDataObj);
    const file = dataparsed.dokumenPeryataanRekeningBerbeda;
    let uniqueFilename: string | null = null;
    const saveto = join("dokumen-pernyataan-rekening-berbeda", dataparsed.id);

    if (file) {
      // Extract the file extension
      const fileExtension = extname(file.name);
      // Generate a unique filename using nanoid
      uniqueFilename = `${createId()}${fileExtension}`;
      console.log("uniqueFilename", uniqueFilename);
      const { filePath, relativePath, fileHash, fileType } = await saveFile({
        file,
        fileName: uniqueFilename,
        directory: saveto,
      });
      logger.info("File saved at:", filePath);
      const savedFile = await logUploadedFile(
        uniqueFilename,
        file.name,
        relativePath,
        fileHash,
        fileType.mime,
        pengguna
      );
      logger.info("File saved to database:", savedFile);
    }

    delete dataparsed.dokumenPeryataanRekeningBerbeda;
    const objNarasumber = dataparsed as Narasumber;
    if (uniqueFilename) {
      objNarasumber.dokumenPeryataanRekeningBerbeda = uniqueFilename;
    }

    const saved = await saveDataToDatabase(objNarasumber, pengguna);
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
  formData: FormData,
  id: string
): Promise<ActionResponse<Narasumber>> => {
  // step 1: parse the form data
  formData.append("id", id);
  return simpanNarasumber(formData);
};

// Function to convert FormData to a plain object
// When FormData is serialized, if there's no file or the field is empty, it's commonly set as an empty string (""), but sometimes frameworks will serialize the value as the string "undefined". This string is not the same as the undefined type in JavaScript. This function will convert the FormData object to a plain object, replacing the string "undefined" with the actual undefined type.
const formDataToObject = (formData: FormData) => {
  const obj: Record<string, any> = {};
  formData.forEach((value, key) => {
    // Check if the value is the string "undefined"
    if (value === "undefined") {
      obj[key] = undefined; // Assign undefined if the value is the string "undefined"
    } else {
      obj[key] = value; // Otherwise, assign the value
    }
  });
  return obj;
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

const updateDataToDatabase = async (
  data: ZNarasumber,
  id: string,
  updatedBy: string
) => {
  const dataUpdatedBy = {
    ...data,
    dokumenPeryataanRekeningBerbeda: data.dokumenPeryataanRekeningBerbeda?.name,
    updatedBy,
  };
  // Save data to database
  try {
    //const result = await dbHonorarium.$transaction(async (prisma) => {
    const newNarasumber = await dbHonorarium.narasumber.update({
      where: {
        id,
      },
      data: dataUpdatedBy,
    });
    // Save data to database
    return newNarasumber;
    // });
    // return result;
  } catch (error) {
    const e = error as CustomPrismaClientError;
    switch (e.code) {
      case "P2002":
        logger.info("There is a unique constraint violation");
        throw new Error("Narasumber dengan NIK yang sama sudah ada");
        break;
      case "P2025":
        logger.info("There is a foreign key constraint violation");
        throw new Error("Narasumber tidak ditemukan");
        break;
      default:
        break;
    }
    logger.error("Error saving data to database:", e);
    throw new Error(e.message);
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
