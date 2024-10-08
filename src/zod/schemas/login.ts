import { z } from "zod";

export const UncomplexLoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type UncomplexLogin = z.infer<typeof UncomplexLoginSchema>;
