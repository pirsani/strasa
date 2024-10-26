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

export async function downloadDokumenNarasumber(req: Request, slug: string[]) {
  // slug[0] is the document type, slug[1] is the kegiatanId
  // check if slug[1] is exist and is a number
  if (!slug[1] || !slug[2]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  try {
    const narasumberId = slug[1];
    //const kegiatan = await getKegiatanById(kegiatanId);
    const narasumber = await dbHonorarium.narasumber.findFirst({
      where: {
        id: narasumberId,
      },
    });
    //logger.info(narasumber);

    const filePath = narasumber?.dokumenPeryataanRekeningBerbeda;
    if (!filePath) {
      return new NextResponse("File not found", { status: 404 });
    }

    // read file from disk and send it to client
    const fullPath = path.posix.join(BASE_PATH_UPLOAD, filePath);
    const fullPathResolvedPath = path.resolve(fullPath);
    const file = await fs.readFile(fullPathResolvedPath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${createId()}.pdf`, // inline or attachment
      },
    });
  } catch (error) {
    return new NextResponse("Error downloading file", { status: 500 });
  }
}

export async function downloadDokumenKonfirmasiKesediaanMengajar(
  req: Request,
  slug: string[]
) {
  // slug[0] is the document type, slug[1] is the kegiatanId
  // check if slug[1] is exist and is a number
  if (!slug[1] || !slug[2]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  try {
    const narasumberId = slug[1];
    const id = slug[2];

    const jadwalNarasumber = await dbHonorarium.jadwalNarasumber.findFirst({
      where: {
        id: id,
        narasumberId: narasumberId,
      },
    });

    const filePath = jadwalNarasumber?.dokumenKonfirmasiKesediaanMengajar;
    if (!filePath) {
      return new NextResponse("File not found", { status: 404 });
    }

    // read file from disk and send it to client
    const fullPath = path.posix.join(BASE_PATH_UPLOAD, filePath);
    const fullPathResolvedPath = path.resolve(fullPath);
    const file = await fs.readFile(fullPathResolvedPath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${createId()}.pdf`, // inline or attachment
      },
    });
  } catch (error) {
    return new NextResponse("Error downloading file", { status: 500 });
  }
}

export default downloadDokumenNarasumber;
