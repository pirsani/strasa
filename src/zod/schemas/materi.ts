import { z } from "zod";

export const materiSchema = z.object({
  kode: z.string().min(3).max(25),
  nama: z
    .string()
    .min(6, {
      message: "Nama materi minimal 6 karakter",
    })
    .max(128, {
      message: "Nama materi maksimal 128 karakter",
    }),
});

export type Materi = z.infer<typeof materiSchema>;
