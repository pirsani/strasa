import { z } from "zod";

export const sbmUhLuarNegeriSchema = z.object({
  negaraId: z.string(),
  satuan: z.string().min(2).max(25),
  golonganA: z.coerce.number().int(),
  golonganB: z.coerce.number().int(),
  golonganC: z.coerce.number().int(),
  golonganD: z.coerce.number().int(),
  tahun: z.coerce.number().int(),
});

export type SbmUhLuarNegeri = z.infer<typeof sbmUhLuarNegeriSchema>;
