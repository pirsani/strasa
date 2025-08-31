import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import { createId } from "@paralleldrive/cuid2";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { Logger } from "tslog";

const logger = new Logger({
  name: "download-dokumen-kegiatan",
  hideLogPositionForProduction: true,
});

export async function downloadDokumenDaftarHadir(req: Request, slug: string[]) {
  // slug[0] is the document type, slug[1] is the jadwalId
  // check if slug[1] is exist and is a number
  if (!slug[1]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  try {
    const jadwalId = slug[1];
    //const kegiatan = await getKegiatanById(kegiatanId);
    const jadwal = await dbHonorarium.jadwal.findFirst({
      where: {
        id: jadwalId,
      },
    });
    //logger.info(narasumber);

    const filePath = jadwal?.dokumenDaftarHadir;
    if (!filePath) {
      return new NextResponse("File not found", { status: 404 });
    }

    // read file from disk and send it to client
    const fullPath = path.posix.join(BASE_PATH_UPLOAD, filePath);
    const fullPathResolvedPath = path.resolve(fullPath);
    const file = await fs.readFile(fullPathResolvedPath);

    const uint8Array = new Uint8Array(file); // Convert Buffer to Uint8Array
    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${createId()}.pdf`, // inline or attachment
      },
    });
  } catch (error) {
    logger.error(error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}

export async function downloadDokumenUndanganNarasumber(
  req: Request,
  slug: string[]
) {
  // slug[0] is the document type, slug[1] is the jadwalId
  // check if slug[1] is exist and is a number
  if (!slug[1]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  try {
    const jadwalId = slug[1];
    //const kegiatan = await getKegiatanById(kegiatanId);
    const jadwal = await dbHonorarium.jadwal.findFirst({
      where: {
        id: jadwalId,
      },
    });
    //logger.info(narasumber);

    const filePath = jadwal?.dokumenUndanganNarasumber;
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
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${createId()}.pdf`, // inline or attachment
      },
    });
  } catch (error) {
    return new NextResponse("Error downloading file", { status: 500 });
  }
}
