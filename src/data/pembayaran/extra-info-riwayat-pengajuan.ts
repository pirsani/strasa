import { JENIS_PENGAJUAN, STATUS_PENGAJUAN } from "@/lib/constants";
import { dbHonorarium } from "@/lib/db-honorarium";

export interface RiwayatPengajuanPaymentStatus {
  id: string;
  kegiatan_id: string;
  mak: string | null;
  kro: string | null;
  uraian: string;
  jenis: JENIS_PENGAJUAN;
  satker_id: string;
  satker_nama: string;
  satker_singkatan: string;
  unit_kerja_id: string;
  unit_kerja_nama: string;
  unit_kerja_singkatan: string;
  status_pembayaran: string;
  total: number;
  pph: number;
  ppn: number;
  status: STATUS_PENGAJUAN;
  diajukan_tanggal: Date;
  diverifikasi_tanggal: Date | null; // Nullable timestamp
  dibayar_tanggal: Date | null; // Nullable timestamp
  ppk_nama: string;
}

// execute query to get pengajuan data from get_riwayat_pengajuan_payment_status function using prisma raw query

export const getRiwayatPengajuanPaymentStatus = async (
  tahun: number,
  satkerId: string
) => {
  const result = await dbHonorarium.$queryRaw<RiwayatPengajuanPaymentStatus[]>`
    select * from get_riwayat_pengajuan_payment_status(${tahun}::int, ${satkerId})
  `;
  return result;
};
