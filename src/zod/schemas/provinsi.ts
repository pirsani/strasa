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

export const provinsiSchema = z.object({
  kode: z.string(),
  tahun: z.coerce.number().int().nullable().optional(), // tahun SK Mendagri
  nama: z
    .string()
    .min(2, {
      message: "Nama provinsi minimal 2 karakter",
    })
    .max(128, {
      message: "Nama provinsi maksimal 128 karakter",
    }),
  urutan: stringOrNumberToNumberOrNull,
  singkatan: emptyStringToNull.nullable(),
});

export type Provinsi = z.infer<typeof provinsiSchema>;
