import { dbHonorarium } from "@/lib/db-honorarium";

interface NearestSatkerAnggaran {
  id: string;
  nama: string;
  singkatan: string;
  isSatkerAnggaran: boolean;
  indukOrganisasiId: string;
}
export const getNearestSatkerAnggaran = async (organisasiId: string) => {
  const nearestSatkerAnggaran = await dbHonorarium.$queryRaw<
    NearestSatkerAnggaran[]
  >`WITH RECURSIVE organisasi_hierarchy AS (
      SELECT 
          id, 
          nama, 
          singkatan, 
          is_satker_anggaran, 
          induk_organisasi_id
      FROM 
          public.organisasi
      WHERE 
          id = ${organisasiId}

      UNION ALL

      SELECT 
          o.id, 
          o.nama, 
          o.singkatan, 
          o.is_satker_anggaran, 
          o.induk_organisasi_id
      FROM 
          public.organisasi o
      INNER JOIN 
          organisasi_hierarchy oh 
      ON 
          o.id = oh.induk_organisasi_id
  )
  SELECT * 
  FROM organisasi_hierarchy
  WHERE is_satker_anggaran = true
  ORDER BY induk_organisasi_id
  LIMIT 1`;
  return nearestSatkerAnggaran[0];
};
