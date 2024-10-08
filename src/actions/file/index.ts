import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import fse from "fs-extra";
import path from "path";
import { Logger } from "tslog";
import { getJenisDokumenFromKey, mapsCuidToJenisDokumen } from "./utils";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

// const SaveAndLogUploadedFile = async (
//   file: File | undefined | null,
//   directory: string,
//   savedBy: string
// ) => {
//   if (!file) {
//     return false;
//   }

//   try {
//     const fileExtension = extname(file.name);
//     // Generate a unique filename using nanoid
//     const uniqueFilename = `${createId}${fileExtension}`;

//     const { filePath, relativePath, fileHash, fileType } = await saveFile({
//       file,
//       fileName: uniqueFilename,
//       directory,
//     });

//     const savedFile = await logUploadedFile(
//       uniqueFilename,
//       file.name,
//       relativePath,
//       fileHash,
//       fileType.mime,
//       savedBy
//     );

//     return { filePath, relativePath, fileHash, fileType };
//   } catch (error) {
//     logger.error("[Error saving file]", error);
//     return false;
//   }
//   // Save the file to disk
// };

export const logUploadedFile = async (
  id: string,
  filename: string,
  filePath: string,
  fileHash: string,
  mimeType: string,
  createdBy: string
) => {
  // Save the file path to the database
  const uploadedFile = await dbHonorarium.uploadedFile.upsert({
    where: { id },
    create: {
      id,
      originalFilename: filename,
      filePath,
      hash: fileHash,
      mimeType,
      createdBy,
      createdAt: new Date(),
    },
    update: {
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

export async function saveDokumenKegiatanToFinalFolder(
  obj: Record<string, any>,
  kegiatanId: string,
  subFolder?: string
) {
  let logUploadedFile: LogUploadedFile[] = [];
  try {
    const kegiatan = await dbHonorarium.kegiatan.findUnique({
      where: { id: kegiatanId },
    });

    if (!kegiatan) {
      throw new Error("Kegiatan tidak ditemukan");
    }

    const kegiatanYear = new Date(kegiatan?.tanggalMulai)
      .getFullYear()
      .toString();

    // Check if file is uploaded by iterating over the entries and then move to final folder
    const finalPath = path.posix.join(
      BASE_PATH_UPLOAD,
      kegiatanYear,
      kegiatanId,
      subFolder ?? ""
    );

    const tempPath = path.posix.join(BASE_PATH_UPLOAD, "temp", kegiatanId);

    // this will not wait for the async operation to finish
    Object.entries(obj).forEach(async ([key, value]) => {
      // do not use async here, it will not wait for the operation to finish
    });

    // we dont use  Object.entries(dokumenUhLuarNegeri).forEach(async ([key, value])
    // because it will not wait for the async operation to finish
    for (const [key, value] of Object.entries(obj)) {
      await (async () => {
        const jenisDokumen = getJenisDokumenFromKey(
          key as keyof typeof mapsCuidToJenisDokumen
        );
        if (!jenisDokumen) {
          logger.error(value, "Jenis dokumen tidak ditemukan, skip key", key);
          return;
        }

        // if value is array, iterate over the array
        if (Array.isArray(value)) {
          for (const val of value) {
            const log = await processFile(
              kegiatanId,
              jenisDokumen,
              val,
              finalPath,
              tempPath
            );
            if (log) {
              logUploadedFile.push(log);
            }
          }
        } else {
          const log = await processFile(
            kegiatanId,
            jenisDokumen,
            value,
            finalPath,
            tempPath
          );
          if (log) {
            logUploadedFile.push(log);
          }
        }

        // logger.info(key, value);
        // logger.info("jenisDokumen", jenisDokumen);
        // const finalPathFile = path.posix.join(finalPath, value);
        // const tempPathFile = path.posix.join(tempPath, value);
        // const resolvedPathFile = path.resolve(finalPathFile);
        // const resolvedTempPathFile = path.resolve(tempPathFile);
        // // check if temp file exists
        // const fileExists = await fse.pathExists(resolvedTempPathFile);
        // if (!fileExists) {
        //   logger.error(
        //     "File not found in temp folder, skipping moving file to final folder"
        //   );
        //   return;
        // }

        // await moveFileToFinalFolder(resolvedTempPathFile, resolvedPathFile);

        // logger.info("File exists in temp folder, moving to final folder");
        // logger.info("collecting log file to be updated in database");
        // logUploadedFile.push({
        //   dokumen: value,
        //   kegiatanId: kegiatanId,
        //   jenisDokumenId: jenisDokumen,
        //   filePath: path.posix.relative(BASE_PATH_UPLOAD, finalPathFile),
        // });
      })();
    }

    return logUploadedFile;
  } catch (error) {
    logger.error("Error moving file:", error);
    //throw new Error("Error parsing form data");
    throw error;
  }
}

export async function processFile(
  kegiatanId: string,
  jenisDokumen: string,
  value: string,
  finalPath: string,
  tempPath: string
) {
  const finalPathFile = path.posix.join(finalPath, value);
  const tempPathFile = path.posix.join(tempPath, value);
  const resolvedPathFile = path.resolve(finalPathFile);
  const resolvedTempPathFile = path.resolve(tempPathFile);
  // check if temp file exists
  // Get the filename from the resolved path
  const filename = path.basename(resolvedPathFile);
  const fileExists = await fse.pathExists(resolvedTempPathFile);
  if (!fileExists) {
    logger.error(
      `File ${filename} not found in temp folder, skipping moving file to final folder`
    );
    return;
  }

  await moveFileToFinalFolder(resolvedTempPathFile, resolvedPathFile);

  logger.info("File exists in temp folder, moving to final folder");
  logger.info("collecting log file to be updated in database");
  return {
    dokumen: value,
    kegiatanId: kegiatanId,
    jenisDokumenId: jenisDokumen,
    filePath: path.posix.relative(BASE_PATH_UPLOAD, finalPathFile),
  };
}

export async function moveFileToFinalFolder(
  tempPath: string,
  finalPath: string
): Promise<void> {
  // Ensure the final folder exists
  // Ensure the final folder exists
  const finalDir = path.dirname(finalPath);
  logger.info("finalDir", finalDir);
  logger.info("finalPath", finalPath);

  try {
    await fse.ensureDir(finalDir);
    // Check if the destination path is a directory
    const isDirectory =
      (await fse.pathExists(finalPath)) &&
      (await fse.stat(finalPath)).isDirectory();

    if (isDirectory) {
      throw new Error(`Cannot overwrite directory '${finalPath}' with a file`);
    }

    // Move the file inside temp folder to final folder
    await fse.move(tempPath, finalPath, {
      overwrite: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      if ((error as NodeJS.ErrnoException).code === "EPERM") {
        console.error("Permission error moving folder:", error);
      } else if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        console.error("Folder not found:", error);
      } else {
        console.error("Error moving folder:", error);
      }
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }
    throw new Error("Error moving folder");
  }
}

export interface LogUploadedFile {
  dokumen: string;
  kegiatanId: string;
  jenisDokumenId: string;
  filePath: string;
}

export async function copyLogUploadedFileToDokumenKegiatan(
  logUploadedFile: LogUploadedFile[],
  penggunaId: string
) {
  try {
    logger.info("moving log record to dokumen kegiatan");
    // Use a for...of loop instead of forEach, which will handle async/await correctly by waiting for each promise to resolve before proceeding to the next iteration.
    const updateKegiatan = await dbHonorarium.$transaction(async (prisma) => {
      for (const log of logUploadedFile) {
        const { dokumen, kegiatanId, jenisDokumenId, filePath } = log;
        // logger.info(
        //   "update dokumen kegiatan",
        //   dokumen,
        //   kegiatanId,
        //   jenisDokumenId,
        //   filePath
        // );

        // select from uploadedFile
        const uploadedFile = await prisma.uploadedFile.findUnique({
          where: { id: dokumen },
        });

        // insert into dokumenKegiatan
        if (!uploadedFile) {
          logger.error(
            dokumen,
            "Log file tidak ditemukan di tabel uploaded_file, skip file"
          );
          continue; // Skip to the next log if log is not found
        }

        await prisma.dokumenKegiatan.create({
          data: {
            dokumen: uploadedFile.id,
            kegiatanId,
            nama: uploadedFile.originalFilename,
            mimeType: uploadedFile.mimeType,
            hash: uploadedFile.hash,
            jenisDokumenId,
            filePath,
            createdBy: penggunaId,
          },
        });
      }
    });
  } catch (error) {
    logger.error("Error updating database entries", error);
    //return getPrismaErrorResponse(error as Error);
    return error;
  }
}
