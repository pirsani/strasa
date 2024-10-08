import { z } from "zod";
import { fileSchema } from "./file-schema";

export const dokumenUhDalamNegeriWithoutFileSchema = z.object({
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
});

export const dokumenUhDalamNegeriFileSchema = z.object({
  laporanKegiatan: fileSchema({ required: true }),
  daftarHadir: fileSchema({ required: true }),
  dokumentasi: fileSchema({ required: true }),
  rampungan: fileSchema({ required: true }),
});

// Merging the schemas
export const dokumenUhDalamNegeriSchema =
  dokumenUhDalamNegeriWithoutFileSchema.merge(dokumenUhDalamNegeriFileSchema);

// export const dokumenUhDalamNegeriSchema = z.object({
//   kegiatanId: z.string(),
//   laporanKegiatan: fileSchema({ required: true }),
//   daftarHadir: fileSchema({ required: true }),
//   dokumentasi: fileSchema({ required: true }),
//   rampungan: fileSchema({ required: true }),
// });

// Extend the refined schema for edit mode
export const dokumenUhDalamNegeriSchemaEditMode =
  dokumenUhDalamNegeriSchema.extend({
    laporanKegiatan: fileSchema({ required: false }),
    daftarHadir: fileSchema({ required: false }),
    dokumentasi: fileSchema({ required: false }),
    rampungan: fileSchema({ required: false }),
  });

export type DokumenUhDalamNegeriWithoutFile = z.infer<
  typeof dokumenUhDalamNegeriWithoutFileSchema
>;
export type DokumenUhDalamNegeriFile = z.infer<
  typeof dokumenUhDalamNegeriFileSchema
>;
export type DokumenUhDalamNegeri = z.infer<typeof dokumenUhDalamNegeriSchema>;
export type DokumenUhDalamNegeriEditMode = z.infer<
  typeof dokumenUhDalamNegeriSchemaEditMode
>;
