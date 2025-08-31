import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { Logger } from "tslog";

const logger = new Logger({
  name: "download-dokumen-kegiatan",
  hideLogPositionForProduction: true,
});

export async function downloadDokumenKegiatan(req: Request, slug: string[]) {
  // slug[0] is the document type, slug[1] is the kegiatanId
  // check if slug[1] is exist and is a number
  if (!slug[1]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  try {
    const dokumenId = slug[1];
    const kegiatanId = slug[2];
    //const kegiatan = await getKegiatanById(kegiatanId);
    const dokumenKegiatan = await getDokumenKegiatan(dokumenId, kegiatanId);
    logger.info(dokumenKegiatan);

    const filePath = dokumenKegiatan?.filePath;
    if (!filePath) {
      return new NextResponse("File not found", { status: 404 });
    }

    // read file from disk and send it to client
    const fullPath = path.posix.join(BASE_PATH_UPLOAD, filePath);
    const fullPathResolvedPath = path.resolve(fullPath);
    const file = await fs.readFile(fullPathResolvedPath);

    const uint8Array = new Uint8Array(file); // Convert Buffer to Uint8Array
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": dokumenKegiatan?.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename=${dokumenKegiatan.originalFilename}`, // inline or attachment
      },
    });
  } catch (error) {
    return new NextResponse("Error downloading file", { status: 500 });
  }
}

export async function getUploadedFile(id: string) {
  const dokumen = await dbHonorarium.dokumenKegiatan.findUnique({
    where: {
      id,
    },
  });
  return dokumen;
}

export async function getDokumenKegiatan(dokumen: string, kegiatanId?: string) {
  const dokumenKegiatan = await dbHonorarium.dokumenKegiatan.findFirst({
    where: {
      dokumen: dokumen,
      ...(kegiatanId && { kegiatanId }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return dokumenKegiatan;
}

export default downloadDokumenKegiatan;
