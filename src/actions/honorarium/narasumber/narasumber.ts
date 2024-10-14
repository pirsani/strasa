"use server";

import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { ActionResponse } from "@/actions/response";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { getJadwalById, JadwalKelasNarasumber } from "@/data/jadwal";
import { dbHonorarium } from "@/lib/db-honorarium";
import { Jadwal } from "@/zod/schemas/jadwal";
import { createId } from "@paralleldrive/cuid2";
import fse from "fs-extra";
import { revalidatePath } from "next/cache";
import path from "path";
import { Logger } from "tslog";
import { moveFileToFinalFolder } from "../../file";
import { getKegiatanById } from "../../kegiatan";
import { getPrismaErrorResponse } from "../../prisma-error-response";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const SimpanJadwalKelasNarasumber = async (
  jadwal: Jadwal
): Promise<ActionResponse<JadwalKelasNarasumber>> => {
  logger.info("[JADWAL]", jadwal);

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;

  const kegiatan = await getKegiatanById(jadwal.kegiatanId);
  if (!kegiatan) {
    return {
      success: false,
      error: "E-KEGIATAN-01",
      message: "Kegiatan not found",
    };
  }

  const tahunKegiatan = kegiatan.tanggalMulai.getFullYear();

  try {
    const moveFileResult = await saveFileToFinalFolder(jadwal, tahunKegiatan);
    const transactionJadwal = await dbHonorarium.$transaction(
      async (prisma) => {
        const jadwalUpsert = await prisma.jadwal.upsert({
          where: { id: jadwal.id || createId() },
          update: {
            materiId: jadwal.materiId,
            kelasId: jadwal.kelasId,
            jumlahJamPelajaran: jadwal.jumlahJamPelajaran,
            tanggal: jadwal.tanggal,
            updatedBy: penggunaId,
            updatedAt: new Date(),
          },
          create: {
            id: jadwal.id,
            kegiatanId: jadwal.kegiatanId,
            materiId: jadwal.materiId,
            kelasId: jadwal.kelasId,
            jumlahJamPelajaran: jadwal.jumlahJamPelajaran,
            dokumenDaftarHadir: moveFileResult?.dokumenDaftarHadirPath,
            dokumenUndanganNarasumber:
              moveFileResult?.dokumenUndanganNarasumberPath,
            tanggal: jadwal.tanggal,
            createdBy: penggunaId,
            createdAt: new Date(),
          },
        });

        for (const narasumberId of jadwal.narasumberIds) {
          await prisma.jadwalNarasumber.upsert({
            where: {
              jadwalId_narasumberId: {
                jadwalId: jadwalUpsert.id,
                narasumberId: narasumberId,
              },
            },
            update: {
              updatedBy: penggunaId,
              updatedAt: new Date(),
            },
            create: {
              jadwalId: jadwalUpsert.id,
              narasumberId: narasumberId,
              jumlahJamPelajaran: jadwal.jumlahJamPelajaran,
              createdBy: penggunaId,
              createdAt: new Date(),
            },
          });
        }

        return jadwalUpsert;
      }
    );

    const jadwalKelasNarasumber = await getJadwalById(transactionJadwal.id);

    if (!jadwalKelasNarasumber) {
      return {
        success: false,
        error: "Error saving data",
      };
    }
    logger.info("revalidatePath");
    revalidatePath("/pengajuan");
    return {
      success: true,
      data: jadwalKelasNarasumber,
    };
  } catch (error) {
    return {
      success: false,
      error: "Error saving data",
    };
  }
};

export const deleteJadwalKelasNarasumber = async (
  jadwalId: string
): Promise<ActionResponse<boolean>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;

  try {
    const transaction = dbHonorarium.$transaction(async (prisma) => {
      await prisma.jadwalNarasumber.deleteMany({
        where: {
          jadwalId: jadwalId,
        },
      });

      await prisma.jadwal.delete({
        where: {
          id: jadwalId,
        },
      });
    });
    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return getPrismaErrorResponse(error as Error);
  }
};

// pinda file dari temp ke final folder menurut NIK narasumber
interface ResultSaveFileToFinalFolder {
  dokumenDaftarHadirPath: string | null;
  dokumenUndanganNarasumberPath: string | null;
}
const saveFileToFinalFolder = async (
  data: Jadwal,
  tahunKegiatan: number
): Promise<ResultSaveFileToFinalFolder | null> => {
  let result: ResultSaveFileToFinalFolder = {
    dokumenDaftarHadirPath: null,
    dokumenUndanganNarasumberPath: null,
  };
  console.log(
    "dokumenCuids",
    data.dokumenDaftarHadirCuid,
    data.dokumenUndanganNarasumberCuid
  );
  if (!data.dokumenDaftarHadirCuid || !data.dokumenUndanganNarasumberCuid) {
    return null;
  }
  try {
    // Save the file to the final folder
    const uploadedFile = await dbHonorarium.uploadedFile.findMany({
      where: {
        id: {
          in: [data.dokumenDaftarHadirCuid, data.dokumenUndanganNarasumberCuid],
        },
      },
    });
    if (!uploadedFile || uploadedFile.length === 0) {
      logger.warn(
        "No file not found in log uploaded file, ignore if this is a existing data"
      );
      return null;
    }

    const finalPath = path.posix.join(
      BASE_PATH_UPLOAD,
      tahunKegiatan.toString(),
      data.kegiatanId,
      "jadwal-kelas-narasumber"
    );
    const tempPath = path.posix.join(BASE_PATH_UPLOAD, "temp", data.kegiatanId);

    for (const file of uploadedFile) {
      const finalPathFile = path.posix.join(finalPath, file.id);
      const tempPathFile = path.posix.join(tempPath, file.id);
      const resolvedPathFile = path.resolve(finalPathFile);
      const resolvedTempPathFile = path.resolve(tempPathFile);
      // check if temp file exists
      const fileExists = await fse.pathExists(resolvedTempPathFile);
      if (!fileExists) {
        logger.error(
          "File not found in temp folder, skipping moving file to final folder"
        );
        continue;
      }
      await moveFileToFinalFolder(resolvedTempPathFile, resolvedPathFile);
      const relativePathFile = path.posix.relative(
        BASE_PATH_UPLOAD,
        resolvedPathFile
      );
      if (file.id === data.dokumenDaftarHadirCuid) {
        result.dokumenDaftarHadirPath = relativePathFile;
      } else if (file.id === data.dokumenUndanganNarasumberCuid) {
        result.dokumenUndanganNarasumberPath = relativePathFile;
      }
    }
    logger.info("collecting log file to be updated in database");
    logger.info(result);
    return result;
  } catch (error) {
    logger.error("Error moving file:", error);
    throw new Error("Error moving file");
  }
};

export default SimpanJadwalKelasNarasumber;
