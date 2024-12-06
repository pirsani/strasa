import { z } from "zod";
import { fileSchema } from "./file-schema";

export const nominatifPembayaranWithoutFileSchema = z.object({
  id: z.string().optional(),
  kegiatanId: z.string().min(21, { message: "Kegiatan harus dipilih" }),
  jenisPengajuan: z
    .string()
    .min(2, { message: "Jenis Pengajuan harus dipilih" }),
  jadwalId: z.string().optional(), // Make jadwalId optional initially
  bendaharaId: z
    .string({ message: "Bendahara harus dipilih" })
    .min(21, { message: "Bendahara harus dipilih" }),
  ppkId: z
    .string({ message: "Ppk harus dipilih" })
    .min(21, { message: "PPK harus dipilih" }),
  buktiPajakCuid: z.string().optional(),
  catatan: z.string().optional(),
});

export const nominatifPembayaranFileSchema = z.object({
  dokumenBuktiPajak: fileSchema({
    required: true,
    message: "Dokumen Bukti Pajak harus diupload",
  }),
});

export const nominatifPembayaranSchema = nominatifPembayaranWithoutFileSchema
  .merge(nominatifPembayaranFileSchema)
  .refine(
    (data) => {
      if (data.jenisPengajuan === "HONORARIUM") {
        return data.jadwalId && data.jadwalId.length >= 21;
      }
      return true;
    },
    {
      message: "Jadwal harus dipilih",
      path: ["jadwalId"], // Specify the path to the field that should show the error
    }
  )
  .refine(
    (data) => {
      if (data.jenisPengajuan === "HONORARIUM") {
        return data.buktiPajakCuid && data.buktiPajakCuid.length >= 21;
      }
      return true;
    },
    {
      message: "Silakan upload dokumen bukti pajak",
      path: ["buktiPajakCuid"], // Specify the path to the field that should show the error
    }
  );

export type NominatifPembayaran = z.infer<typeof nominatifPembayaranSchema>;
export type NominatifPembayaranWithoutFile = z.infer<
  typeof nominatifPembayaranWithoutFileSchema
>;
