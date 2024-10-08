import { z } from "zod";

export const sbmUangRepresentasiSchema = z.object({
  satuan: z.string().min(2).max(25),
  luarKota: z.coerce.number().int(),
  dalamKota: z.coerce.number().int(),
  pejabatId: z.coerce.number().int(),
  tahun: z.coerce.number().int(),
});

export type SbmUangRepresentasi = z.infer<typeof sbmUangRepresentasiSchema>;
