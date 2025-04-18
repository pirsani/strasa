import { z } from "zod";

export const kroSchema = z.object({
  id: z.string().optional(),
  kode: z.string().min(3).max(128),
  nama: z
    .string()
    .min(6, {
      message: "Nama kro minimal 6 karakter",
    })
    .max(128, {
      message: "Nama kro maksimal 128 karakter",
    }),
  deskripsi: z.string().optional().nullable(),
  tahun: z.coerce.number().min(2024).max(2030),
});

export type Kro = z.infer<typeof kroSchema>;
