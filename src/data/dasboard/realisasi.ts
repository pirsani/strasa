"use server";
import { dbHonorarium } from "@/lib/db-honorarium";

interface DataRealisasi {
  payment_status: string;
  total: number;
}
export const getDataRealisasi = async (satkerId: string, year: number) => {
  const result = await dbHonorarium.$queryRaw<DataRealisasi[]>`
    SELECT 
    CASE 
      WHEN rp.status IN ('PAID', 'END') THEN 'SUDAH'
      ELSE 'BELUM'
    END AS payment_status,
    SUM(
      CASE 
        WHEN rp.jenis = 'HONORARIUM' THEN COALESCE((rp.extra_info->'summedFields'->>'jumlahBruto')::numeric, 0) 
        ELSE COALESCE((rp.extra_info->'summedFields'->>'total')::numeric, 0) 
      END
    ) AS total
  FROM riwayat_pengajuan rp 
  INNER JOIN kegiatan k ON rp.kegiatan_id = k.id 
  WHERE rp.jenis IN ('UH_DALAM_NEGERI', 'UH_LUAR_NEGERI', 'HONORARIUM')
    AND EXTRACT(YEAR FROM k.tanggal_mulai) = ${year}
    AND k.satker_id = ${satkerId}
  GROUP BY 
    CASE 
      WHEN rp.status IN ('PAID', 'END') THEN 'SUDAH'
      ELSE 'BELUM'
    END;
  `;
  return result;
};
