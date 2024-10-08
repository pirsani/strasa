import { fileSchema } from "@/zod/schemas/file-schema";
import { z } from "zod";

export const excelDataReferensiSchema = z.object({
  file: fileSchema({
    required: true,
    allowedTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  }),
});

export type excelDataReferensi = z.infer<typeof excelDataReferensiSchema>;
