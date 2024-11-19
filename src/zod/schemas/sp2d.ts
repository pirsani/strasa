import { z } from "zod";
import { fileSchema } from "./file-schema";
import { fnTanggalSchema } from "./tanggal";

const stringToBigIntOrNull = z
  .union([z.string(), z.bigint()])
  .transform((val) => {
    if (typeof val === "string") {
      try {
        return BigInt(val);
      } catch {
        return null;
      }
    }
    return val;
  });

export const sp2dSchema = z.object({
  id: z.string().optional(),
  nomor: z.string(),
  tanggal: fnTanggalSchema({ fieldDesc: "Tanggal Selesai" }),
  jumlahDiminta: stringToBigIntOrNull.optional(),
  jumlahPotongan: stringToBigIntOrNull.optional(),
  jumlahDibayar: stringToBigIntOrNull.optional(),
  dokumenCuid: z.string().optional(),
  dokumenFile: fileSchema({
    required: false,
  }),
  //tahun: z.number().min(2024).max(2030),
  unitKerjaId: z.string(),
});

export type Sp2d = z.infer<typeof sp2dSchema>;
