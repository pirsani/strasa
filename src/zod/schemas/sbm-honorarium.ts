import { z } from "zod";

export const sbmHonorariumSchema = z.object({
  jenis: z.string().min(2).max(50),
  satuan: z.string().min(2).max(25),
  besaran: z.coerce.number().int(),
  uraian: z.string().min(2).max(150),
  tahun: z.coerce.number().int(),
});

export type SbmHonorarium = z.infer<typeof sbmHonorariumSchema>;
