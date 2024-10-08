import { z } from "zod";

export const kelasSchema = z.object({
  kode: z.string().min(3).max(25),
  nama: z
    .string()
    .min(6, {
      message: "Nama kelas minimal 6 karakter",
    })
    .max(128, {
      message: "Nama kelas maksimal 128 karakter",
    }),
  kegiatanId: z.string(),
});

export type Kelas = z.infer<typeof kelasSchema>;
