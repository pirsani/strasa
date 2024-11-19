import { z } from "zod";

const stringToBigIntOrNull = z
  .union([z.string(), z.bigint()])
  .transform((val) => {
    if (typeof val === "string") {
      try {
        return BigInt(val);
      } catch {
        return null;
      }
    }
    return val;
  });

export const paguSchema = z.object({
  id: z.string().optional(),
  //tahun: z.number().min(2024).max(2030),
  unitKerjaId: z.string(),
  pagu: stringToBigIntOrNull,
});

export type Pagu = z.infer<typeof paguSchema>;
