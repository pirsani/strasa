import { z } from "zod";
import { fileSchema } from "./file-schema";

export const nominatifHonorariumSchema = z.object({
  id: z.string(),
  kegiatanId: z.string().min(21, { message: "Kegiatan harus dipilih" }),
  jenisPengajuan: z
    .string()
    .min(2, { message: "Jenis Pengajuan harus dipilih" }),
  jadwalId: z.string().min(21, { message: "Jadwal harus dipilih" }),
  bendaharaId: z.string().min(21, { message: "Bendahara harus dipilih" }),
  ppkId: z.string().min(21, { message: "PPK harus dipilih" }),
  dokumenBuktiPajak: fileSchema({ required: true }),
  buktiPajakCuid: z.string().min(21, { message: "Bukti Pajak harus dipilih" }),
  catatan: z.string().optional(),
});

export type NominatifHonorarium = z.infer<typeof nominatifHonorariumSchema>;
