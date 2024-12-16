import { z } from "zod";
import { fileSchema } from "./file-schema";
import { fnTanggalSchema } from "./tanggal";

const stringToBigIntOrNull = z
  .union([z.string(), z.bigint()])
  .transform((val) => {
    if (typeof val === "string") {
      try {
        return BigInt(val);
      } catch {
        return null;
      }
    }
    return val;
  });

export const pembayaranBaseSchema = z.object({
  riwayatPengajuanId: z.string().min(21),
  dibayarTanggal: fnTanggalSchema({ fieldDesc: "Tanggal dibayar" }),
  mak: z.string().optional(),
  buktiPembayaranCuid: z.string().min(5),
  filenameBuktiPembayaran: z.string().min(5),
  // jumlahDibayar: stringToBigIntOrNull,
});

export type PembayaranWithoutFile = z.infer<typeof pembayaranBaseSchema>;

export const pembayaranSchema = pembayaranBaseSchema.merge(
  z.object({
    buktiPembayaran: fileSchema({
      required: true,
    }),
  })
);

// export const pembayaranSchema = z.object({
//   riwayatPengajuanId: z.string().min(21),
//   dibayarTanggal: fnTanggalSchema({ fieldDesc: "Tanggal dibayar" }),
//   buktiPembayaranCuid: z.string().min(5),
//   buktiPembayaran: fileSchema({
//     required: true,
//   }),
//   filenameBuktiPembayaran: z.string().min(5),
// });

export type Pembayaran = z.infer<typeof pembayaranSchema>;
