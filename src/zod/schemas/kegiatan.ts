import { isValid, parseISO } from "date-fns";
import { z } from "zod";
import { fileSchema } from "./file-schema";
import { fnTanggalSchema } from "./tanggal";

// Define the enum values as a Zod enum
const LokasiEnum = z.enum(["DALAM_KOTA", "LUAR_KOTA", "LUAR_NEGERI"]);

// Custom validation function to check if the input is a valid date string
const isValidDateString = (value: string): boolean => {
  const parsedDate = parseISO(value);
  return isValid(parsedDate);
};

interface TanggalSchemaOptions {
  message?: string;
  field?: string;
}
// const tanggalSchema = ({
//   message = "",
//   field = "Tanggal",
// }: TanggalSchemaOptions) => {
//   const tanggalSchema = z
//     .string({ message: `${field} harus diisi` })
//     .min(10, {
//       message: `format ${field} harus yyyy-mm-dd`,
//     })
//     .max(10, {
//       message: `format ${field} harus yyyy-mm-dd`,
//     })
//     .refine(isValidDateString, {
//       message: `format  ${field} harus yyyy-mm-dd`,
//     })
//     .transform((value) => new Date(value));
//   return tanggalSchema;
// };

export const baseKegiatanSchema = z.object({
  cuid: z.string({ required_error: "CUID harus diisi" }),
  nama: z
    .string()
    .min(10, {
      message: "Nama kegiatan minimal 10 karakter",
    })
    .max(500, {
      message: "Nama kegiatan maksimal 500 karakter",
    }),
  kro: z.string().optional().nullable(),
  tanggalMulai: fnTanggalSchema({ fieldDesc: "Tanggal Mulai" }),
  tanggalSelesai: fnTanggalSchema({ fieldDesc: "Tanggal Selesai" }),
  lokasi: LokasiEnum, // Use the Zod enum schema for lokasi
  provinsi: z.string().optional().nullable(),
  kota: z.string().optional().nullable(),
  dokumenNodinMemoSk: fileSchema({
    required: true,
    message: "Dokumen Nodin/Memo/SK harus diupload",
  }),
  dokumenNodinMemoSkCuid: z.string(),
  dokumenJadwal: fileSchema({
    required: true,
    message: "Dokumen jadwal harus diupload",
  }),
  dokumenJadwalCuid: z.string(),
  dokumenSuratSetnegSptjm: fileSchema({
    required: false,
    message: "Dokumen jadwal harus diupload",
  }),
  dokumenSuratSetnegSptjmCuid: z.string().optional(),
  dokumenSuratTugas: z.union([
    fileSchema({
      required: true,
      message: "Dokumen Surat Tugas harus diupload",
    }),
    z
      .array(
        fileSchema({
          required: true,
          message: "Dokumen Surat Tugas harus diupload",
        })
      )
      .nonempty({ message: "Dokumen Surat Tugas harus diupload" }),
  ]),
  dokumenSuratTugasCuid: z.union([
    z.string(),
    z.array(z.string()).nonempty({ message: "Surat Tugas harus diisi" }),
  ]),
  pesertaXlsx: fileSchema({
    required: true,
    message: "File Excel daftar peserta harus diupload",
    allowedTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  }),
  pesertaXlsxCuid: z.string({
    required_error: "file Excel daftar peserta harus diisi",
  }),
  isValidItinerary: z.boolean({ message: "invalid itinerary" }).optional(),
  itinerary: z.array(z.any()).optional(),
});

// Apply the refine method to add custom validation
export const kegiatanSchema = baseKegiatanSchema
  .refine((data) => data.tanggalMulai <= data.tanggalSelesai, {
    message: "Tanggal Mulai harus kurang dari atau sama dengan Tanggal Selesai",
    path: ["tanggalMulai"], // This will point the error to the tanggalMulai field
  })
  .refine(
    (data) => {
      console.log(data);
      if (data.lokasi === "LUAR_KOTA") {
        return !!data.provinsi;
      }
      return true;
    },
    {
      message: "Provinsi jika lokasi kegiatan luar kota",
      path: ["provinsi"],
    }
  )
  .refine(
    (data) => {
      console.log(data);
      if (data.lokasi === "LUAR_KOTA") {
        return !!data.kota;
      }
      return true;
    },
    {
      message: "kota harus diisi jika lokasi kegiatan luar kota",
      path: ["kota"],
    }
  )
  .refine(
    (data) => {
      if (data.lokasi === "LUAR_NEGERI") {
        return !!data.dokumenSuratSetnegSptjm;
      }
      return true;
    },
    {
      message:
        "Dokumen Surat Setneg/SPTJM harus diupload jika lokasi kegiatan luar negeri",
      path: ["dokumenSuratSetnegSptjm"],
    }
  )
  .refine(
    (data) => {
      if (data.lokasi === "LUAR_NEGERI") {
        return !!data.dokumenSuratSetnegSptjmCuid;
      }
      return true;
    },
    {
      message:
        "Dokumen Surat Setneg/SPTJM harus diupload jika lokasi kegiatan luar negeri",
      path: ["dokumenSuratSetnegSptjmCuid"],
    }
  )
  .refine(
    (data) => {
      if (data.lokasi === "LUAR_NEGERI") {
        return data.isValidItinerary === true;
      }
      return true;
    },
    {
      message: "Invalid itinerary. Periksa kembali itinerary kegiatan",
      path: ["isValidItinerary"],
    }
  )
  .refine((data) => data.tanggalMulai <= data.tanggalSelesai, {
    message: "Tanggal Mulai harus kurang dari atau sama dengan Tanggal Selesai",
    path: ["tanggalMulai"], // This will point the error to the tanggalMulai field
  });

export const kegiatanSchemaWithoutFile = baseKegiatanSchema.omit({
  dokumenNodinMemoSk: true,
  dokumenJadwal: true,
  dokumenSuratTugas: true,
  pesertaXlsx: true,
});

// Extend the refined schema for edit mode
export const kegiatanSchemaEditMode = baseKegiatanSchema
  .extend({
    dokumenNodinMemoSk: fileSchema({ required: false }),
    dokumenJadwal: fileSchema({ required: false }),
    dokumenSuratTugas: z
      .union([
        fileSchema({
          required: true,
          message: "Dokumen Surat Tugas harus diupload",
        }),
        z.array(
          fileSchema({
            required: true,
            message: "Dokumen Surat Tugas harus diupload",
          })
        ),
      ])
      .optional()
      .nullable(),
    dokumenSuratTugasCuid: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .nullable(),
    pesertaXlsx: fileSchema({
      required: false,
      allowedTypes: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    }),
  })
  .refine((data) => data.tanggalMulai <= data.tanggalSelesai, {
    message: "Tanggal Mulai harus kurang dari atau sama dengan Tanggal Selesai",
    path: ["tanggalMulai"], // This will point the error to the tanggalMulai field
  })
  .refine(
    (data) => {
      console.log(data);
      if (data.lokasi === "LUAR_KOTA") {
        return !!data.provinsi;
      }
      return true;
    },
    {
      message: "Provinsi jika lokasi kegiatan luar kota",
      path: ["provinsi"],
    }
  )
  .refine(
    (data) => {
      console.log(data);
      if (data.lokasi === "LUAR_KOTA") {
        return !!data.kota;
      }
      return true;
    },
    {
      message: "kota harus diisi jika lokasi kegiatan luar kota",
      path: ["kota"],
    }
  )
  .refine(
    (data) => {
      console.log(data);
      if (data.lokasi === "LUAR_KOTA") {
        return !!data.kota;
      }
      return true;
    },
    {
      message: "kota harus diisi jika lokasi kegiatan luar kota",
      path: ["kota"],
    }
  );
// .refine(
//   (data) => {
//     if (data.lokasi === "LUAR_NEGERI") {
//       return !!data.dokumenSuratSetnegSptjm;
//     }
//     return true;
//   },
//   {
//     message:
//       "Dokumen Surat Setneg/SPTJM harus diupload jika lokasi kegiatan luar negeri",
//     path: ["dokumenSuratSetnegSptjm"],
//   }
// )
// .refine(
//   (data) => {
//     if (data.lokasi === "LUAR_NEGERI") {
//       return data.isValidItinerary === true;
//     }
//     return true;
//   },
//   {
//     message: "Invalid itinerary. Periksa kembali itinerary kegiatan",
//     path: ["isValidItinerary"],
//   }
// );

export type Kegiatan = z.infer<typeof kegiatanSchema>;
export type KegiatanEditMode = z.infer<typeof kegiatanSchemaEditMode>;

export default kegiatanSchema;
