import { z } from "zod";

// Define the Zod schema
// if golongan ruang is enum of string, we can use z.enum
export const pesertaSchema = z.object({
  ID: z.number(),
  Nama: z.string(),
  NIP: z.string().min(18).max(18),
  "Golongan/Ruang": z.enum([
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
  ]),
  Jabatan: z.string(),
  "Nama Rekening": z.string(),
  Bank: z.string(),
  "No Rekening": z.string(),
  Eselon: z.string().optional(), // Optional field
});
