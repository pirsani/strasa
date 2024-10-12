import { z } from "zod";

const emptyStringToNull = z
  .string()
  .transform((val) => (val === "" || val === "-" ? null : val.toUpperCase()));

const stringOrNumberToNumberOrNull = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === "string") {
      return val === "" || val === "-" ? null : Number(val);
    }
    return val;
  })
  .nullable();

export const kotaSchema = z.object({
  id: z.string().optional(),
  provinsiId: z.string(),
  nama: z
    .string()
    .min(2, {
      message: "Nama Kota minimal 2 karakter",
    })
    .max(128, {
      message: "Nama Kota maksimal 128 karakter",
    }),
  singkatan: emptyStringToNull.nullable(),
});

export type Kota = z.infer<typeof kotaSchema>;
