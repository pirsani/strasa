import { z } from "zod";

export const sbmTaksiSchema = z.object({
  provinsiId: z.string(),
  satuan: z.string().min(2).max(25),
  besaran: z.coerce.number().int(),
  tahun: z.coerce.number().int(),
});

export type SbmTaksi = z.infer<typeof sbmTaksiSchema>;
