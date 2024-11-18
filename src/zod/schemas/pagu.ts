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

export const paguSchema = z.object({
  id: z.string().optional(),
  //tahun: z.number().min(2024).max(2030),
  unitKerjaId: z.string(),
  pagu: stringToNumberOrNull,
});

export type Pagu = z.infer<typeof paguSchema>;
