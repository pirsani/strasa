import { z } from "zod";
import { fileSchema } from "./file-schema";

const jadwalWithoutFileSchema = z.object({
  id: z.string().optional(),
  kegiatanId: z.string(),
  materiId: z.string(),
  kelasId: z.string(),
  jumlahJamPelajaran: z.coerce
    .number()
    .transform((val) => (isNaN(val) ? 0 : val)), // Transform NaN to 0
  narasumberIds: z.array(z.string().min(16).max(16)),
  tanggal: z.coerce.date(),
  dokumenDaftarHadirCuid: z.string(),
  dokumenSuratCuid: z.string(),
});

const jadwalFileSchema = z.object({
  dokumenDaftarHadir: fileSchema({ required: true }),
  dokumenSurat: fileSchema({ required: true }),
});

export const jadwalSchema = jadwalWithoutFileSchema.merge(jadwalFileSchema);

export type JadwalWithoutFile = z.infer<typeof jadwalWithoutFileSchema>;

// export const jadwalSchema = z.object({
//   id: z.string().optional(),
//   kegiatanId: z.string(),
//   materiId: z.string(),
//   kelasId: z.string(),
//   jumlahJamPelajaran: z.coerce
//     .number()
//     .transform((val) => (isNaN(val) ? 0 : val)), // Transform NaN to 0
//   narasumberIds: z.array(z.string().min(16).max(16)),
//   tanggal: z.coerce.date(),
//   dokumenDaftarHadir: fileSchema({ required: true }),
//   dokumenDaftarHadirCuid: z.string(),
//   dokumenSurat: fileSchema({ required: true }),
//   dokumenSuratCuid: z.string(),
// });

export type Jadwal = z.infer<typeof jadwalSchema>;
