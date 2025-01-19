"use server";

import { moveFileToFinalFolder } from "@/actions/file";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { ActionResponse } from "@/actions/response";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { getJadwalById } from "@/data/jadwal";
import { dbHonorarium } from "@/lib/db-honorarium";
import { NarasumberJadwal } from "@/zod/schemas/narasumber-jadwal";
import fse from "fs-extra";
import path from "path";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const simpanNarasumberJadwal = async (
  narasumberJadwal: NarasumberJadwal
): Promise<ActionResponse<boolean>> => {
  logger.info("[NARASUMBER JADWAL]", narasumberJadwal);

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;

  const jadwal = await getJadwalById(narasumberJadwal.jadwalId);
  console.log(jadwal);
  if (!jadwal || !jadwal.kegiatan) {
    return {
      success: false,
      error: "E-SNJ-JADWAL-01",
      message: "Jadwal not found",
    };
  }

  // insert into jadwal_narasumber

  try {
    const tahunKegiatan = jadwal.kegiatan.tanggalMulai.getFullYear();
    const moveFileResult = await saveFileKonfirmasiNarasumber(
      jadwal.kegiatan.id,
      narasumberJadwal,
      tahunKegiatan
    );

    const transactioanNarasumberJadwal = await dbHonorarium.$transaction(
      async (prisma) => {
        for (const narasumberId of narasumberJadwal.narasumberIds) {
          const narsum = await prisma.narasumber.findUnique({
            where: { id: narasumberId },
          });
          // object narsum to json
          // TODO: we will later improve this to be more performant
          const asWas = {
            narasumber: JSON.parse(JSON.stringify(narsum)),
          };

          const dokumenKonfirmasiKesediaanMengajar =
            moveFileResult?.dokumenKonfirmasiNarasumber.find((dokumen) => {
              const lastPart = path.parse(dokumen).name;
              //const [idNarasumber, _ext] = dokumen.split(".");
              // extract narasumberId from dokumen name
              // lihat zod formatted dokumenKonfirmasiNarasumber
              const extracted = lastPart.split("-")[0];
              return extracted === narasumberId;
            });

          await prisma.jadwalNarasumber.upsert({
            where: {
              jadwalId_narasumberId: {
                jadwalId: jadwal.id,
                narasumberId: narasumberId,
              },
            },
            update: {
              jumlahJamPelajaran: narasumberJadwal.jumlahJamPelajaran,
              jenisHonorariumId: narasumberJadwal.jenisHonorariumId,
              dokumenKonfirmasiKesediaanMengajar:
                dokumenKonfirmasiKesediaanMengajar,
              updatedBy: penggunaId,
              updatedAt: new Date(),
              asWas,
            },
            create: {
              jadwalId: jadwal.id,
              narasumberId: narasumberId,
              jumlahJamPelajaran: narasumberJadwal.jumlahJamPelajaran,
              jenisHonorariumId: narasumberJadwal.jenisHonorariumId,
              dokumenKonfirmasiKesediaanMengajar:
                dokumenKonfirmasiKesediaanMengajar,
              createdBy: penggunaId,
              createdAt: new Date(),
              asWas,
            },
          });
        }
      }
    );

    return {
      success: true,
      data: true,
      message: "Data saved",
    };
  } catch (error) {
    logger.error("[NARASUMBER JADWAL] Error saving data", error);
    return {
      success: false,
      error: "Error saving data",
      message: (error as Error).message,
    };
  }
};

interface ResultSaveFileToFinalFolder {
  dokumenKonfirmasiNarasumber: string[];
}
const saveFileKonfirmasiNarasumber = async (
  kegiatanId: string,
  data: NarasumberJadwal,
  tahunKegiatan: number
): Promise<ResultSaveFileToFinalFolder | null> => {
  let result: ResultSaveFileToFinalFolder = {
    dokumenKonfirmasiNarasumber: [],
  };

  if (data.dokumenKonfirmasiNarasumber.length === 0) {
    return result;
  }

  try {
    const uploadedFiles = await dbHonorarium.uploadedFile.findMany({
      where: {
        id: {
          in: data.dokumenKonfirmasiNarasumber,
        },
      },
    });

    if (uploadedFiles.length !== data.dokumenKonfirmasiNarasumber.length) {
      throw new Error("Uploaded file not found");
    }

    const finalPath = path.posix.join(
      BASE_PATH_UPLOAD,
      tahunKegiatan.toString(),
      kegiatanId,
      "jadwal-kelas-narasumber",
      data.jadwalId
    );
    const tempPath = path.posix.join(
      BASE_PATH_UPLOAD,
      "temp",
      kegiatanId,
      data.jadwalId
    );

    for (const file of uploadedFiles) {
      const finalPathFile = path.posix.join(finalPath, file.id);
      const tempPathFile = path.posix.join(tempPath, file.id);
      const resolvedPathFile = path.resolve(finalPathFile);
      const resolvedTempPathFile = path.resolve(tempPathFile);
      // check if temp file exists
      const fileExists = await fse.pathExists(resolvedTempPathFile);
      if (!fileExists) {
        logger.warn(
          "File not found in temp folder, skipping moving file to final folder"
        );
        continue;
      }
      await moveFileToFinalFolder(resolvedTempPathFile, resolvedPathFile);
      const relativePathFile = path.posix.relative(
        BASE_PATH_UPLOAD,
        resolvedPathFile
      );
      result.dokumenKonfirmasiNarasumber.push(relativePathFile);
    }
    logger.info("collecting log file to be updated in database");
    logger.info(result);
    return result;
  } catch (error) {
    logger.error("[NARASUMBER JADWAL] Error saving file", error);
    return null;
  }
};

export const deleteNarasumberJadwal = async (
  narasumberId: string,
  jadwalId: string
): Promise<ActionResponse<boolean>> => {
  try {
    const { count } = await dbHonorarium.jadwalNarasumber.deleteMany({
      where: {
        jadwalId,
        narasumberId,
      },
    });

    if (count === 0) {
      return {
        success: false,
        error: "E-SNJ-JADWAL-02",
        message: "Data not found",
      };
    }

    logger.info("[NARASUMBER JADWAL] Data deleted");
    return {
      success: true,
      data: true,
      message: "Data deleted",
    };
  } catch (error) {
    logger.error("[NARASUMBER JADWAL] Error deleting data", error);
    return {
      success: false,
      error: "Error deleting data",
      message: (error as Error).message,
    };
  }
};
