import { z } from "zod";
import { fileSchema } from "./file-schema";

export const dokumenUhLuarNegeriWithoutFileSchema = z.object({
  kegiatanId: z.string({ required_error: "Tidak ada referensi kegiatan" }),
  laporanKegiatanCuid: z.string({
    required_error: "Dokumen laporan kegiatan harus diupload",
  }),
  daftarHadirCuid: z.string({
    required_error: "Dokumen daftar hadir harus diupload",
  }),
  dokumentasiKegiatanCuid: z.string({
    required_error: "Dokumen dokumentasi harus diupload",
  }),
  rampunganTerstempelCuid: z.string({
    required_error: "Dokumen rampungan harus diupload",
  }),
  suratPersetujuanJaldisSetnegCuid: z.string({
    required_error: "Dokumen surat setneg harus diupload",
  }),
  pasporCuid: z.string({ required_error: "Dokumen paspor harus diupload" }),
  tiketBoardingPassCuid: z.string({
    required_error: "Dokumen tiket boarding pass harus diupload",
  }),
});

export const dokumenUhLuarNegeriFileSchema = z.object({
  laporanKegiatan: fileSchema({ required: true }),
  daftarHadir: fileSchema({ required: true }),
  dokumentasi: fileSchema({ required: true }),
  rampungan: fileSchema({ required: true }),
  suratSetneg: fileSchema({ required: true }),
  paspor: fileSchema({ required: true }),
  tiketBoardingPass: fileSchema({ required: true }),
});

// Merging the schemas
export const dokumenUhLuarNegeriSchema =
  dokumenUhLuarNegeriWithoutFileSchema.merge(dokumenUhLuarNegeriFileSchema);

// Extend the refined schema for edit mode
export const dokumenUhLuarNegeriSchemaEditMode =
  dokumenUhLuarNegeriSchema.extend({
    laporanKegiatan: fileSchema({ required: false }),
    daftarHadir: fileSchema({ required: false }),
    dokumentasi: fileSchema({ required: false }),
    rampungan: fileSchema({ required: false }),
    suratSetneg: fileSchema({ required: false }),
    paspor: fileSchema({ required: false }),
    tiketBoardingPass: fileSchema({ required: false }),
  });
export type DokumenUhLuarNegeriWithoutFile = z.infer<
  typeof dokumenUhLuarNegeriWithoutFileSchema
>;
export type DokumenUhLuarNegeriFile = z.infer<
  typeof dokumenUhLuarNegeriFileSchema
>;
export type DokumenUhLuarNegeri = z.infer<typeof dokumenUhLuarNegeriSchema>;
export type DokumenUhLuarNegeriEditMode = z.infer<
  typeof dokumenUhLuarNegeriSchemaEditMode
>;
