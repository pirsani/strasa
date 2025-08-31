export type JenisPengajuan =
  | "GENERATE_RAMPUNGAN"
  | "HONORARIUM"
  | "UH_DALAM_NEGERI"
  | "UH_LUAR_NEGERI"
  | "PENGGANTIAN_REINBURSEMENT"
  | "PEMBAYARAN_PIHAK_KETIGA";

export interface ResultPaguRealisasi {
  year: number;
  unit_kerja_id: string;
  nama: string;
  singkatan: string;
  realisasi: bigint;
  pagu: bigint;
  sisa: bigint;
}
