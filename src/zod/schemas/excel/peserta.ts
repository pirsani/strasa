import { noConflict } from "lodash";
import { date, z } from "zod";

const validPangkatGolonganIds = [
  "I/A",
  "I/B",
  "I/C",
  "I/D",
  "II/A",
  "II/B",
  "II/C",
  "II/D",
  "III/A",
  "III/B",
  "III/C",
  "III/D",
  "IV/A",
  "IV/B",
  "IV/C",
  "IV/D",
  "IV/E",
];

export const pesertaSchema = z
  .object({
    nama: z.string().min(3).max(255),
    NIP: z.string().min(18).max(18).optional(),
    NIK: z.string().min(16).max(16),
    NPWP: z.string().min(15).max(16).optional(),
    pangkatGolonganId: z
      .string()
      .refine((val) => validPangkatGolonganIds.includes(val.toUpperCase()), {
        message: "Invalid pangkatGolonganId",
      }),
    jabatan: z.string().min(3).max(255),
    eselon: z.string().min(1).max(3).optional(),
    email: z.string().email().optional(),
    telp: z.string().min(6).max(16).optional(),
    bank: z.string().min(2).max(100),
    namaRekening: z.string().min(3).max(255),
    nomorRekening: z.string().min(10).max(50),
  })
  .passthrough(); // Allow additional attributes

export type Jadwal = z.infer<typeof pesertaSchema>;
