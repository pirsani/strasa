import { z } from "zod";
import { roleIdSchema } from "./role";

// Regular expression for a complex password
const complexPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const passwordSchema = z.string().min(8).regex(complexPasswordRegex, {
  message:
    "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
});

const emptyStringToNull = z
  .string()
  .transform((val) => (val === "" || val === "-" ? null : val));

export const penggunaSchema = z
  .object({
    id: z.union([z.string().cuid(), z.literal("admin")]).optional(),
    organisasiId: z.string().cuid().optional().nullable(),
    name: z
      .string()
      .min(5, {
        message: "Nama Pengguna minimal 5 karakter",
      })
      .max(128, {
        message: "Nama Pengguna maksimal 255 karakter",
      }),
    email: z.string().email(),
    password: z.string().optional(),
    rePassword: z.string().optional(),
    roles: z.array(roleIdSchema).optional().nullable(),
    NIP: z
      .union([
        z
          .string()
          .length(1, {
            message:
              "NIP harus 18 digit atau hanya karakter '-' jika tidak ada",
          })
          .regex(/^-$/), // Single character "-"
        z
          .string()
          .length(18)
          .regex(/^\d{18}$/), // 18-character number
      ])
      .transform((val) => (val === "-" ? null : val))
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.id) {
      if (!data.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password is required for new user",
          path: ["password"],
        });
      }
      if (!data.rePassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "rePassword is required for new user",
          path: ["rePassword"],
        });
      }
    }
    if (data.password && data.password !== data.rePassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password and rePassword must match",
        path: ["rePassword"],
      });
    }
    if (data.password && !data.id && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 8,
        type: "string",
        inclusive: true,
        message: "Password must be at least 8 characters long",
        path: ["password"],
      });
    }
  });

export type Pengguna = z.infer<typeof penggunaSchema>;
