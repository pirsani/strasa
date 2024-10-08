import { z } from "zod";

function formatFileSize(bytes: number, si: boolean = true): string {
  const unit = si ? 1000 : 1024;
  if (bytes < unit) return bytes + " B";
  const exp = Math.floor(Math.log(bytes) / Math.log(unit));
  const pre = (si ? "kMGTPE" : "KMGTPE").charAt(exp - 1) + (si ? "" : "i");
  return (bytes / Math.pow(unit, exp)).toFixed(2) + " " + pre + "B";
}

interface fileSchemaOptions {
  maxsize?: number;
  required?: boolean;
  allowedTypes?: string[];
  message?: string;
}
export const fileSchema = ({
  maxsize = 100 * 1024 * 1024,
  required = true,
  allowedTypes = ["application/pdf"],
  message = "Silakan pilih file",
}: fileSchemaOptions = {}) => {
  const baseSchema = z
    .instanceof(File, { message: message })
    .refine((file) => file.size > 0, "file tidak boleh kosong")
    .refine(
      (file) => file.size < maxsize,
      `Ukuran file maksimal ${formatFileSize(maxsize)}`
    )
    .refine((file) => allowedTypes.includes(file.type), {
      message: `Format file harus salah satu dari: ${allowedTypes.join(", ")}`,
    });

  return required ? baseSchema : z.union([baseSchema, z.undefined(), z.null()]);
};
