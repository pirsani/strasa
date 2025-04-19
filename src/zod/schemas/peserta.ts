import { z } from "zod";
import { fileSchema } from "./file-schema";
import { pangkatGolonganOptionalNullableSchema } from "./golongan-ruang";

const emptyStringToNull = z
  .string()
  .transform((val) => (val === "" || val === "-" ? null : val));

export const pesertaWithoutFileSchema = z.object({
  id: z
    .string()
    .min(16, {
      message:
        "NIK harus 16 digit, jika paspor setelah nomor paspor diikuti tanda strip dan angka 0 sampai penuh 16 digit",
    })
    .max(16), // id adalah NIK 16 digit jika paspor untuk nonwni maka 16 digit dimulai dari 9 dan 7 digit pertama adalah nomor paspor dan 9 digit terakhir adalah tanggal lahir di format yyyymmdd contoh dipisah dengan strip
  nama: z.string().min(3).max(150),
  NIP: z.union([
    z
      .string()
      .length(1, {
        message: "NIP harus 18 digit atau hanya karakter '-' jika tidak ada",
      })
      .regex(/^-$/), // Single character "-"
    z
      .string()
      .length(18)
      .regex(/^\d{18}$/), // 18-character number
  ]),
  NPWP: z.union([
    z
      .string()
      .length(1, {
        message:
          "NPWP harus 15 atau 16 angka atau hanya karakter '-' jika tidak ada",
      })
      .regex(/^-$/, {
        message:
          "NPWP harus 15 atau 16 angka atau hanya karakter '-' jika tidak ada",
      }), // Single character "-"
    z
      .string()
      .min(15)
      .max(16)
      .regex(/^\d{15,16}$/), // 15 to 16 characters, all digits
  ]),
  pangkatGolonganId: pangkatGolonganOptionalNullableSchema,
  jabatan: z.string().min(1, {
    message: "isi dengan '-' jika tidak ada jabatan",
  }),
  eselon: z
    .preprocess((val) => {
      if (val === "" || val === "-" || val === undefined) return null;
      return typeof val === "string" ? parseInt(val, 10) : val;
    }, z.union([z.number().min(1).max(4), z.null()]))
    .refine((val) => val === null || [1, 2, 3, 4].includes(val), {
      message: "isi dengan 1, 2, 3, atau 4 jika pejabat eselon",
    })
    .nullable()
    .optional(),

  email: emptyStringToNull
    .nullable()
    .optional()
    .refine(
      (val) =>
        val === null ||
        val === undefined ||
        z.string().email().safeParse(val).success,
      {
        message: "Invalid email address",
      }
    ),
  telp: emptyStringToNull.nullable().optional(),
  bank: z.string().min(2, { message: "Nama bank minimal 2 karakter" }).max(150),
  namaRekening: z
    .string()
    .min(3, { message: "Nama rekening minimal 3 karakter" })
    .max(150),
  nomorRekening: z
    .string()
    .min(5, { message: "Nomor rekening minimal 5 karakter" })
    .max(150),
  dokumenPeryataanRekeningBerbedaCuid: z.string().optional(),
});

export const pesertaFileSchema = z.object({
  dokumenPeryataanRekeningBerbeda: fileSchema({ required: false }),
});

export const pesertaSchema = pesertaWithoutFileSchema.merge(pesertaFileSchema);

export type Peserta = z.infer<typeof pesertaSchema>;

export const pesertaEditModeSchema = pesertaSchema.extend({
  dokumenPeryataanRekeningBerbeda: z.union([
    fileSchema({ required: false }),
    z.undefined(),
    z.null(),
  ]),
});

export type PesertaWithoutFile = z.infer<typeof pesertaWithoutFileSchema>;

export type PesertaForEditing = z.infer<typeof pesertaEditModeSchema>;
// export type PesertaForEditing = Omit<
//   PesertaWithStringDate,
//   "dokumenPeryataanRekeningBerbeda"
// > & { dokumenPeryataanRekeningBerbeda: File | string | null | undefined };

export type PesertaWithStringDate = Omit<Peserta, "createdAt" | "updatedAt"> & {
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
};
