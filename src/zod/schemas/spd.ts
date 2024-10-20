import { z } from "zod";

export const spdSchema = z.object({
  spdId: z.string().optional(),
  ppkId: z.string().min(21, { message: "PPK harus dipilih" }),
  kegiatanId: z.string().min(21, { message: "Kegiatan harus dipilih" }),
  akun: z.string().optional(),
  keterangan: z.string().optional(),
});

export type Spd = z.infer<typeof spdSchema>;
