import { z } from "zod";

export const narasumberJadwalSchema = z
  .object({
    id: z.string().optional(),
    jadwalId: z
      .string({ message: "Tidak ada Jadwal yang dipilih" })
      .min(24, { message: "Tidak ada Jadwal yang dipilih" }),
    jumlahJamPelajaran: z.coerce
      .number({ message: "Silakan isi jumlah jam pelajaran" })
      .transform((val) => (isNaN(val) ? 0 : val)), // Transform NaN to 0
    narasumberIds: z.array(z.string().min(16).max(16)).min(1, {
      message: "Silakan pilih minimal 1 narasumber",
    }),
    jenisHonorariumId: z
      .string()
      .min(24, { message: "Silakan pilih jenis honorarium" }),
    dokumenKonfirmasiNarasumber: z
      .array(
        z
          .string({ message: "upload dokumen konfirmasi narasumber" })
          .min(44) // ini idNarasumber + "-" + jadwalId + ".pdf"  (24 + 16 + 4)
          .max(54) // ini idNarasumber + "-" + jadwalId + ".pdf" (32 + 16 + 4)
      )
      .min(1, {
        message: "upload dokumen konfirmasi narasumber",
      }),
  })
  .refine(
    (data) => {
      // Ensure each narasumberId has a corresponding dokumenKonfirmasiNarasumber
      const { narasumberIds, dokumenKonfirmasiNarasumber } = data;
      const expectedDokumen = narasumberIds.map((id) =>
        formatDokumenKonfirmasiId(id, data.jadwalId)
      );
      return expectedDokumen.every((doc) =>
        dokumenKonfirmasiNarasumber.includes(doc)
      );
    },
    {
      message:
        "Dokumen Konfirmasi Narasumber harus sesuai dengan jumlah Narasumber",
      path: ["dokumenKonfirmasiNarasumber"],
    }
  );

export const formatDokumenKonfirmasiId = (
  narsumLabel: string,
  jadwalId: string
) => {
  const narasumberId = narsumLabel.split("-")[0];
  return narasumberId + "-" + jadwalId + ".pdf";
};

export type NarasumberJadwal = z.infer<typeof narasumberJadwalSchema>;
