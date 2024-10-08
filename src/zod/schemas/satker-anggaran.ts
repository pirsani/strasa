import { z } from "zod";

export const satkerAnggaranSchema = z.object({
  id: z.string(),
  isSatkerAnggaran: z.boolean(),
});

export type SatkerAnggaran = z.infer<typeof satkerAnggaranSchema>;
