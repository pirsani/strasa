import { z } from "zod";

export const roleIdSchema = z.union([
  z.string().cuid(),
  z.literal("superadmin"),
]);

export const roleSchema = z.object({
  id: roleIdSchema.optional(),
  permissions: z.array(z.string().cuid()).optional().nullable(),
  name: z
    .string()
    .min(5, {
      message: "Nama Role minimal 5 karakter",
    })
    .max(128, {
      message: "Nama Role maksimal 255 karakter",
    }),
});

export type Role = z.infer<typeof roleSchema>;
