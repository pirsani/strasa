import { z } from "zod";

export const sbmUhDalamNegeriSchema = z.object({
  provinsiId: z.string(),
  satuan: z.string().min(2).max(25),
  fullboard: z.coerce.number().int(),
  fulldayHalfday: z.coerce.number().int(),
  luarKota: z.coerce.number().int(),
  dalamKota: z.coerce.number().int(),
  diklat: z.coerce.number().int(),
  tahun: z.coerce.number().int(),
});

export type SbmUhDalamNegeri = z.infer<typeof sbmUhDalamNegeriSchema>;
