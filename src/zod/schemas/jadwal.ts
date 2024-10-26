import { z } from "zod";
import { fileSchema } from "./file-schema";

const jadwalWithoutFileSchema = z.object({
  id: z.string().optional(),
  kegiatanId: z
    .string()
    .min(21, { message: "Tidak ada Kegiatan yang dipilih" }),
  materiId: z.string().min(21, { message: "Silakan pilih materi" }),
  kelasId: z.string().min(21, { message: "Silakan pilih kelas" }),
  jumlahJamPelajaran: z.coerce
    .number({ message: "Silakan isi jumlah jam pelajaran" })
    .transform((val) => (isNaN(val) ? 0 : val)), // Transform NaN to 0
  narasumberIds: z.array(z.string().min(16).max(16)).min(1, {
    message: "Silakan pilih minimal 1 narasumber",
  }),
  tanggal: z.coerce.date({ message: "Silakan pilih tanggal" }),
  dokumenDaftarHadirCuid: z.string(),
  dokumenUndanganNarasumberCuid: z.string(),
  dokumenKonfirmasiNarasumber: z
    .array(
      z
        .string({ message: "upload dokumen konfirmasi narasumber" })
        .min(20) // ini dari idNarasumber + ".pdf" 20 character
        .max(20)
    )
    .min(1, {
      message: "upload dokumen konfirmasi narasumber",
    }),
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

export type Jadwal = z.infer<typeof jadwalSchema>;
