import { z } from "zod";

export const UncomplexLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export type UncomplexLogin = z.infer<typeof UncomplexLoginSchema>;
