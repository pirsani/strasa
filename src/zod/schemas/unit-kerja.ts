import { z } from "zod";

const stringToNumberOrNull = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return val;
  });

export const unitKerjaSchema = z.object({
  id: z.string().cuid().optional(),
  nama: z
    .string()
    .min(6, {
      message: "Nama Unit Kerja minimal 5 karakter",
    })
    .max(128, {
      message: "Nama Unit Kerja maksimal 255 karakter",
    }),
  singkatan: z
    .string()
    .min(2, {
      message: "Singkatan Unit Kerja minimal 2 karakter",
    })
    .max(15, {
      message: "Singkatan Unit Kerja maksimal 15 karakter",
    }),
  indukOrganisasiId: z.string().cuid(),
  isSatkerAnggaran: z.boolean().nullable().optional(),
  eselon: stringToNumberOrNull.nullable().optional(),
});

export type UnitKerja = z.infer<typeof unitKerjaSchema>;
