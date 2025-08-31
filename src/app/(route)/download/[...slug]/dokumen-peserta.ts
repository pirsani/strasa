import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import { createId } from "@paralleldrive/cuid2";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function downloadDokumenPeserta(req: Request, slug: string[]) {
  // slug[0] is the document type, slug[1] is the kegiatanId
  // check if slug[1] is exist and is a number
  if (!slug[1] || !slug[2]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  try {
    const pesertaId = slug[1];
    //const kegiatan = await getKegiatanById(kegiatanId);
    const peserta = await dbHonorarium.peserta.findFirst({
      where: {
        id: pesertaId,
      },
    });
    //logger.info(peserta);

    const filePath = peserta?.dokumenPeryataanRekeningBerbeda;
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
        "Content-Disposition": `attachment; filename=${createId()}.pdf`, // inline or attachment
      },
    });
  } catch (error) {
    return new NextResponse("Error downloading file", { status: 500 });
  }
}

export default downloadDokumenPeserta;
