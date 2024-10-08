import { NextRequest, NextResponse } from "next/server";
import path, { extname } from "path";

import { logUploadedFile } from "@/actions/file";
import saveFile from "@/utils/file-operations/save";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();

    const filename = data.get("filename") as string;

    const file = data.get("file") as File;
    const originalFilename = file.name;
    const sanitized = originalFilename.replace(/[^a-z0-9.]/gi, "_");
    const folderIdentifier = data.get("folder") as string; // folder identifier is kegiatanId
    // check if file have extension

    let hasFileExtension = getFileExtension(filename);
    let uniqueFilename;
    if (hasFileExtension) {
      console.log("hasFileExtension", hasFileExtension);
      const fileExtension = extname(file.name);
      const isSameExtension = fileExtension === hasFileExtension;
      console.log("isSameExtension", isSameExtension);
      // do not add extension if it is the same
      uniqueFilename = filename;
    } else {
      const fileExtension = extname(file.name);
      uniqueFilename = `${filename}${fileExtension}`;
    }

    const fileExtension1 = extname(file.name);
    const fileExtension2 = extname(filename);

    if (fileExtension1 !== fileExtension2) {
      uniqueFilename = `${filename}${fileExtension1}`;
    } else {
      uniqueFilename = filename;
    }

    // base path will be mange on save.ts
    const filesFolder = path.posix.join("temp", folderIdentifier);

    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const { filePath, relativePath, fileHash, fileType } = await saveFile({
      file,
      fileName: uniqueFilename,
      directory: filesFolder,
      allowedMimeTypes,
    });

    // log upladed file
    //logger.info("File saved at:", filePath);
    const savedFile = await logUploadedFile(
      uniqueFilename,
      file.name,
      relativePath,
      fileHash,
      fileType.mime,
      "admin"
    );
    //logger.info("File saved to database:", savedFile);

    return NextResponse.json({ message: "Upload complete" });
  } catch (error) {
    console.error("[ERROR UPLOAD]", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  } finally {
    console.log("Upload complete");
  }
}

function getFileExtension(filename: string) {
  return filename.split(".").pop();
}
