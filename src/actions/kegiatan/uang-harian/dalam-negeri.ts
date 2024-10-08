"use server";
import {
  copyLogUploadedFileToDokumenKegiatan,
  LogUploadedFile,
  moveFileToFinalFolder,
} from "@/actions/file";
import {
  getJenisDokumenFromKey,
  mapsCuidToJenisDokumen,
} from "@/actions/file/utils";
import { ErrorResponseSwitcher } from "@/actions/lib";
import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { ActionResponse } from "@/actions/response";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import {
  DokumenUhDalamNegeri,
  DokumenUhDalamNegeriWithoutFile,
  dokumenUhDalamNegeriWithoutFileSchema,
} from "@/zod/schemas/dokumen-uh-dalam-negeri";
import { Kegiatan } from "@prisma-honorarium/client";
import fse from "fs-extra";
import path from "path";
import { Logger } from "tslog";
import { updateStatusUhDalamNegeri } from "../proses";

// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

// upload file to temp folder
// update kegiatan status
// move file to permanent folder
export const ajukanUhDalamNegeri = async (
  dokumenUhDalamNegeri: DokumenUhDalamNegeri
): Promise<ActionResponse<Kegiatan | null>> => {
  // parse again zod schema
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  let logUploadedFile: LogUploadedFile[] = [];

  try {
    // step 1. try to move file to final folder
    logUploadedFile = await saveFileToFinalFolder(dokumenUhDalamNegeri);
    if (logUploadedFile.length === 0) {
      return {
        success: false,
        error: "E-FDN01", // no file found in temp folder
        message: "No File Found",
      };
    }

    // step 2. update database entries
    await copyLogUploadedFileToDokumenKegiatan(
      logUploadedFile,
      pengguna.data.penggunaId
    );

    // step 3. update kegiatan status Uh Luar Negeri
    const kegiatanUpdated = await updateStatusUhDalamNegeri(
      dokumenUhDalamNegeri.kegiatanId,
      "pengajuan"
    );

    return kegiatanUpdated;
  } catch (error) {
    return ErrorResponseSwitcher(error);
  }
};

async function saveFileToFinalFolder(
  dokumenUhDalamNegeriWithoutFile: DokumenUhDalamNegeriWithoutFile
) {
  let logUploadedFile: LogUploadedFile[] = [];
  try {
    const dokumenUhDalamNegeri = dokumenUhDalamNegeriWithoutFileSchema.parse(
      dokumenUhDalamNegeriWithoutFile
    );

    const kegiatanId = dokumenUhDalamNegeri.kegiatanId;

    const kegiatan = await dbHonorarium.kegiatan.findUnique({
      where: { id: kegiatanId },
    });

    if (!kegiatan) {
      throw new Error("Kegiatan tidak ditemukan");
    }

    const kegiatanYear = new Date(kegiatan?.tanggalMulai)
      .getFullYear()
      .toString();
    // Type assertion to make TypeScript treat the property as optional
    delete (dokumenUhDalamNegeri as { kegiatanId?: string }).kegiatanId;
    // Check if file is uploaded by iterating over the entries and then move to final folder
    const finalPath = path.posix.join(
      BASE_PATH_UPLOAD,
      kegiatanYear,
      kegiatanId,
      "uh-dalam-negeri"
    );

    const tempPath = path.posix.join(BASE_PATH_UPLOAD, "temp", kegiatanId);

    // this will not wait for the async operation to finish
    Object.entries(dokumenUhDalamNegeri).forEach(async ([key, value]) => {
      const jenisDokumen = getJenisDokumenFromKey(
        key as keyof typeof mapsCuidToJenisDokumen
      );
      console.log(key, value);
    });

    // we dont use  Object.entries(dokumenUhDalamNegeri).forEach(async ([key, value])
    // because it will not wait for the async operation to finish
    for (const [key, value] of Object.entries(dokumenUhDalamNegeri)) {
      await (async () => {
        const jenisDokumen = getJenisDokumenFromKey(
          key as keyof typeof mapsCuidToJenisDokumen
        );
        if (!jenisDokumen) {
          logger.error(value, "Jenis dokumen tidak ditemukan, skip file");
          return;
        }

        // logger.info(key, value);
        // logger.info("jenisDokumen", jenisDokumen);
        const finalPathFile = path.posix.join(finalPath, value);
        const tempPathFile = path.posix.join(tempPath, value);
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

        logger.info("File exists in temp folder, moving to final folder");
        logger.info("collecting log file to be updated in database");
        logUploadedFile.push({
          dokumen: value,
          kegiatanId: kegiatanId,
          jenisDokumenId: jenisDokumen,
          filePath: path.posix.relative(BASE_PATH_UPLOAD, finalPathFile),
        });
      })();
    }

    return logUploadedFile;
  } catch (error) {
    logger.error("Error moving file:", error);
    //throw new Error("Error parsing form data");
    throw error;
  }
}

export default ajukanUhDalamNegeri;
