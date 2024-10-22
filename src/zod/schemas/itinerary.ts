import { isValid, parseISO } from "date-fns";
import { z } from "zod";

// Custom validation function to check if the input is a valid date string
const isValidDateString = (value: string): boolean => {
  const parsedDate = parseISO(value);
  return isValid(parsedDate);
};

// tanggal schema union of string and date agar pada saat input data akan diperlakukan sebagai string sebenernya
// karena input tidak mengenal Date object
interface TanggalSchemaOptions {
  message?: string;
  fieldLabel?: string;
}
const tanggalSchema = ({
  message = "",
  fieldLabel = "Tanggal",
}: TanggalSchemaOptions) => {
  return z.union([
    z
      .string({ message: `${fieldLabel} harus diisi` })
      .min(10, {
        message: `format ${fieldLabel} harus yyyy-mm-dd`,
      })
      .max(10, {
        message: `format ${fieldLabel} harus yyyy-mm-dd`,
      })
      .refine(isValidDateString, {
        message: `format ${fieldLabel} harus yyyy-mm-dd`,
      })
      .transform((value) => new Date(value)),
    z.date(),
  ]);
};
// Define the base itinerary schema
export const baseItinerarySchema = z.object({
  id: z.string().optional(),
  tanggalMulai: tanggalSchema({ fieldLabel: "Tanggal Mulai" }),
  tanggalTiba: tanggalSchema({ fieldLabel: "Tanggal Tiba" }),
  tanggalSelesai: tanggalSchema({
    fieldLabel: "Tanggal Selesai",
  }),
  dariLokasiId: z.string().min(3, { message: "Dari Lokasi harus diisi" }),
  dariLokasi: z.string().optional().nullable(),
  keLokasiId: z.string().min(3, { message: "Ke Lokasi harus diisi" }),
  keLokasi: z.string().optional().nullable(),
});

// Ensure tanggalMulai is less than or equal to tanggalSelesai
export const itinerarySchema = baseItinerarySchema.refine(
  (data) => data.tanggalMulai.getTime() <= data.tanggalTiba.getTime(),
  {
    message: "Tanggal Mulai harus kurang dari atau sama dengan Tanggal Selesai",
    path: ["tanggalMulai"], // Point the error to tanggalMulai field
  }
);

// Type inference
export type Itinerary = z.infer<typeof itinerarySchema>;

// Define an array of itineraries (optional)
export const itineraryArraySchema = z.array(itinerarySchema).optional();
