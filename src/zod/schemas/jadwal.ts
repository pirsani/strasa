import { z } from "zod";
import { fileSchema } from "./file-schema";

const jadwalWithoutFileSchema = z.object({
  id: z.string().optional(),
  kegiatanId: z.string(),
  materiId: z.string({ message: "Silakan pilih materi" }),
  kelasId: z.string({ message: "Silakan pilih kelas" }),
  jumlahJamPelajaran: z.coerce
    .number({ message: "Silakan isi jumlah jam pelajaran" })
    .transform((val) => (isNaN(val) ? 0 : val)), // Transform NaN to 0
  narasumberIds: z.array(z.string().min(16).max(16), {
    message: "Silakan pilih minimal 1 narasumber",
  }),
  tanggal: z.coerce.date({ message: "Silakan pilih tanggal" }),
  dokumenDaftarHadirCuid: z.string(),
  dokumenUndanganNarasumberCuid: z.string(),
});

const jadwalFileSchema = z.object({
  dokumenDaftarHadir: fileSchema({
    required: true,
    message: "Dokumen Daftar harus diupload",
  }),
  dokumenUndanganNarasumber: fileSchema({
    required: true,
    message: "Dokumen Surat/Nodin/Memo Undangan Narsum harus diupload",
  }),
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
//   dokumenUndanganNarasumber: fileSchema({ required: true }),
//   dokumenUndanganNarasumberCuid: z.string(),
// });

export type Jadwal = z.infer<typeof jadwalSchema>;
