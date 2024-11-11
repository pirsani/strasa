import { BASE_PATH_UPLOAD } from "@/app/api/upload/config";
import { dbHonorarium } from "@/lib/db-honorarium";
import { createId } from "@paralleldrive/cuid2";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

/**
 * @description Downloads bukti pembayaran narasumber PDF file.
 *
 * @route /download/bukti-pembayaran/:riwayatPengajuanId
 *
 * @additionalNotes
 * It will return a 404 error if the file is not found.
 * It will return a 500 error if there is an error when downloading the file.
 * It will return a 400 error if the request is invalid.
 */
export const downloadDokumenBuktiPembayaran = async (
  req: Request,
  slug: string[]
) => {
  if (!slug[1]) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  try {
    const riwayatPengajuanId = slug[1];

    const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findFirst({
      where: {
        id: riwayatPengajuanId,
      },
    });

    if (!riwayatPengajuan || !riwayatPengajuan.dokumenBuktiPembayaran) {
      return new NextResponse("File not found", { status: 404 });
    }

    const filePath = riwayatPengajuan.dokumenBuktiPembayaran;
    // read file from disk and send it to client
    const fullPath = path.posix.join(BASE_PATH_UPLOAD, filePath);
    // resolve the path to avoid path traversal attack
    const fullPathResolvedPath = path.resolve(fullPath);
    const file = await fs.readFile(fullPathResolvedPath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${createId()}.pdf`, // inline or attachment
      },
    });
    //const id = slug[2];
  } catch (error) {
    return new NextResponse("Error downloading file", { status: 500 });
  }
};
