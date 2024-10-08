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

const fallbackPathChunk = path.posix.join(cwdPosix, "BASE_PATH_UPLOAD_CHUNK");
export const BASE_PATH_UPLOAD_CHUNK =
  process.env.BASE_PATH_UPLOAD_CHUNK || fallbackPathChunk;
if (!process.env.BASE_PATH_UPLOAD_CHUNK) {
  console.warn(
    `BASE_PATH_UPLOAD_CHUNK is not defined in the .env file. Using default value: ${fallbackPath}`
  );
}
