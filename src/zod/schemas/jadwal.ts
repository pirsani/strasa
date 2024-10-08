import { date, z } from "zod";
import { fileSchema } from "./file-schema";

export const jadwalSchema = z.object({
  materiId: z.string(),
  kelasId: z.string(),
  narasumberIds: z.array(z.string().min(16).max(16)),
  tanggal: z.coerce.date(),
  dokumenDaftarHadir: fileSchema({ required: true }),
  dokumenSurat: fileSchema({ required: true }),
});

export type Jadwal = z.infer<typeof jadwalSchema>;
