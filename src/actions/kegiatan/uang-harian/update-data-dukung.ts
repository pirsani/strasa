"use server";
import { moveFileToFinalFolder } from "@/actions/file";
import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { ActionResponse } from "@/actions/response";
import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import { createId } from "@paralleldrive/cuid2";
import { DokumenKegiatan, Kegiatan } from "@prisma-honorarium/client";
import path from "path";
export const UpdateDataDukung = async (
  kegiatanId: string,
  id: string,
  newDokumenId: string
): Promise<ActionResponse<DokumenKegiatan>> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;

  const dokumenKegiatan = await dbHonorarium.dokumenKegiatan.findUnique({
    where: {
      id: id,
      kegiatanId: kegiatanId,
    },
    include: {
      kegiatan: true,
    },
  });

  if (!dokumenKegiatan || !dokumenKegiatan.kegiatan) {
    return {
      success: false,
      error: "E-UDK01",
      message: "Dokumen kegiatan tidak ditemukan",
    };
  }

  try {
    const tempFilename = `${newDokumenId}.pdf`;
    const newCuid = createId();
    const updatedFilename = `${dokumenKegiatan.jenisDokumenId}-${newCuid}.pdf`;

    const uploadedFile = await dbHonorarium.uploadedFile.findUnique({
      where: {
        id: tempFilename,
      },
    });

    if (!uploadedFile) {
      return {
        success: false,
        error: "E-UDK03",
        message: "Dokumen belum terupload",
      };
    }

    // Move file to final folder
    const relativePath = await saveFileToFinalFolder(
      dokumenKegiatan.kegiatan,
      tempFilename,
      updatedFilename
    );

    // Update database entries

    const updatedDokumen = await dbHonorarium.dokumenKegiatan.update({
      where: {
        id: id,
      },
      data: {
        dokumen: updatedFilename,
        filePath: relativePath,
        updatedAt: new Date(),
        updatedBy: penggunaId,
        nama: uploadedFile.originalFilename,
        originalFilename: uploadedFile.originalFilename,
      },
    });

    console.log("[UpdateDataDukung] updatedDokumen", updatedDokumen);

    return {
      success: true,
      data: updatedDokumen,
    };
  } catch (error) {
    console.error("[UpdateDataDukung] error", error);
    return {
      success: false,
      error: "E-UDK02",
      message: "Gagal mengupdate data dukung",
    };
  }
};

const saveFileToFinalFolder = async (
  kegiatan: Kegiatan,
  tempFilename: string,
  updatedFilename: string
) => {
  const kegiatanYear = new Date(kegiatan?.tanggalMulai)
    .getFullYear()
    .toString();
  console.log("[saveFileToFinalFolder]");

  const dnLn =
    kegiatan.lokasi === "LUAR_NEGERI" ? "uh-luar-negeri" : "uh-dalam-negeri";

  const finalPath = path.posix.join(
    BASE_PATH_UPLOAD,
    kegiatanYear,
    kegiatan.id,
    dnLn
  );
  const finalPathFile = path.posix.join(finalPath, updatedFilename);

  const tempPath = path.posix.join(BASE_PATH_UPLOAD, "temp", kegiatan.id);
  const tempPathFile = path.posix.join(tempPath, tempFilename);

  const resolvedPathFile = path.resolve(finalPathFile);
  const resolvedTempPathFile = path.resolve(tempPathFile);

  await moveFileToFinalFolder(resolvedTempPathFile, resolvedPathFile);

  const filePath = path.posix.relative(BASE_PATH_UPLOAD, finalPathFile);
  return filePath;
};

export default UpdateDataDukung;
