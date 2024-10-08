import { createHash } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import path from "path";

// Convert the current working directory to a POSIX-compatible path
const cwdPosix = process.cwd().replace(/\\/g, "/");

const fallbackPath = path.posix.join(cwdPosix, "BASE_PATH_UPLOAD");
export const BASE_PATH_UPLOAD = process.env.BASE_PATH_UPLOAD || fallbackPath;
if (!process.env.BASE_PATH_UPLOAD) {
  console.warn(
    `BASE_PATH_UPLOAD is not defined in the .env file. Using default value: ${fallbackPath}`
  );
}
// Now you can use BASE_PATH_UPLOAD in your application
console.log(`Base path for uploads: ${BASE_PATH_UPLOAD}`);

// Save files to the desired storage
/*
@usage 

const file = new File(["content"], "example.txt", { type: "text/plain" });
const directory = BASE_PATH_UPLOAD; // Use the environment variable
saveFile({ file, fileName: "example.txt", directory })
  .then((filePath) => {
    console.log(`File saved at ${filePath}`);
  })
  .catch((error) => {
    console.error("Error saving file:", error);
  });

  or 

  try {
    const filePath = await saveFile({ file, fileName: "example.txt", directory });
    console.log(`File saved at ${filePath}`);
  } catch (error) {
    console.error("Error saving file:", error);
  }

  Summary
  .then() and .catch(): Traditional promise handling, method chaining.
  async/await: Modern syntax, more readable, uses try/catch for error handling.
*/

interface SaveFileOptions {
  file: File | Buffer;
  fileName: string;
  directory?: string;
  allowedMimeTypes?: string[];
}
const saveFile = async ({
  file,
  fileName,
  directory,
  allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"],
}: SaveFileOptions) => {
  // Check if the input is a file

  let buffer: ArrayBuffer | Buffer;

  // Handle both File and Buffer types
  if (file instanceof File) {
    buffer = await file.arrayBuffer(); // Convert File to ArrayBuffer
  } else if (file instanceof Buffer) {
    buffer = file; // Use Buffer directly
  } else {
    throw new Error("The provided input is neither a valid File nor Buffer.");
  }

  // Fix the directory handling
  if (!directory) {
    directory = BASE_PATH_UPLOAD;
  } else {
    // Ensure the directory does not repeat the base path
    directory = path.posix.join(BASE_PATH_UPLOAD, directory);
  }

  // Ensure the directory exists
  const dirPath = path.resolve(directory);
  if (!fs.existsSync(dirPath)) {
    console.log("Creating directory:", dirPath);
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Convert ArrayBuffer to Buffer if necessary
  const fileBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  // Check if the file type is allowed
  const fileType = await fileTypeFromBuffer(fileBuffer);
  if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
    throw new Error("Invalid file type.");
  }

  //  const filePath = path.join(dirPath, fileName);
  const filePath = path.posix.join(directory, fileName); // Use path.posix.join
  const resolvedPath = path.join(dirPath, fileName);
  await fs.promises.writeFile(resolvedPath, Buffer.from(fileBuffer));
  //await fs.writeFile(filePath, buffer);

  // Calculate the hash of the file using SHA-256
  const hashSum = createHash("sha256");
  hashSum.update(Buffer.from(fileBuffer));
  const fileHash = hashSum.digest("hex");

  // Calculate the relative path from the base path
  // Use path.posix to ensure consistent delimiters (forward slashes)
  const basePathUpload = path.resolve(BASE_PATH_UPLOAD);
  const relativePath = path.posix.relative(BASE_PATH_UPLOAD, filePath); // Use path.posix.relative
  console.log("BASE_PATH_UPLOAD:", BASE_PATH_UPLOAD);
  console.log("basePathUpload:", basePathUpload);
  console.log("filePath:", filePath);
  console.log("relativePath:", relativePath);

  return { filePath, relativePath, fileType, fileHash };
};

export default saveFile;
