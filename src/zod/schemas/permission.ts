import { z } from "zod";

export const permissionSchema = z.object({
  id: z.string().cuid().optional(),
  name: z
    .string()
    .min(6, {
      message: "Nama Permission minimal 5 karakter",
    })
    .max(128, {
      message: "Nama Permission maksimal 255 karakter",
    }),
});

export type Permission = z.infer<typeof permissionSchema>;
