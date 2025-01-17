-- This is an empty migration.
-- USAGE 

-- select * from get_riwayat_pengajuan_payment_status(2024,'cm489wk3t0067ztxywua8w1to')


-- find all enum types in the database

-- SELECT 
--     n.nspname AS schema_name,
--     t.typname AS enum_type_name
-- FROM 
--     pg_type t
-- JOIN 
--     pg_namespace n ON n.oid = t.typnamespace
-- WHERE 
--     t.typtype = 'e'
-- ORDER BY 
--     schema_name, enum_type_name;
   

DROP FUNCTION IF EXISTS get_riwayat_pengajuan_payment_status(integer, text);

CREATE OR REPLACE FUNCTION get_riwayat_pengajuan_payment_status(
    p_year INT,
    p_satker_id TEXT
)
RETURNS TABLE (
    id TEXT, 
    kegiatan_id TEXT,
    kegiatan_nama TEXT,
    mak TEXT, 
    kro text,
    uraian TEXT,
    jenis "JENIS_PENGAJUAN", -- Enum type remains the same
    satker_id TEXT,
    satker_nama TEXT,
    satker_singkatan TEXT,
    unit_kerja_id TEXT,
    unit_kerja_nama TEXT,
    unit_kerja_singkatan TEXT,
    status_pembayaran TEXT,
    total numeric,
    pph numeric,
    ppn numeric,
    status "STATUS_PENGAJUAN",
	diajukan_tanggal timestamp(3) ,
	diverifikasi_tanggal timestamp(3) ,
 	dibayar_tanggal timestamp(3),
 	ppk_nama TEXT
)
AS $$
BEGIN
    RETURN QUERY
    WITH pengajuan_cte AS (
        SELECT  
            rp.id,
            rp.jenis,
            k.satker_id,
            CASE 
                WHEN rp.status IN ('PAID', 'END') THEN 'SUDAH'
                ELSE 'BELUM'
            END AS status_pembayaran,
            SUM(
                CASE 
                    WHEN rp.jenis = 'HONORARIUM' THEN COALESCE((rp.extra_info->'summedFields'->>'jumlahBruto')::numeric, 0) 
                    ELSE COALESCE((rp.extra_info->'summedFields'->>'total')::numeric, 0) 
                END
            ) AS total,
			SUM(
                CASE 
                    WHEN rp.jenis = 'HONORARIUM' THEN COALESCE((rp.extra_info->'summedFields'->>'pph')::numeric, 0) 
                    ELSE 0::numeric 
                END
            ) AS pph,
			0::numeric AS ppn -- nantinya ini akan dipake untuk pembayaran pihak ketiga
        FROM 
            riwayat_pengajuan rp 
        INNER JOIN 
            kegiatan k ON rp.kegiatan_id = k.id
        WHERE 
            rp.jenis IN ('UH_DALAM_NEGERI', 'UH_LUAR_NEGERI', 'HONORARIUM')
            AND EXTRACT(YEAR FROM k.tanggal_mulai) = p_year
            AND k.satker_id = p_satker_id
        GROUP BY 
            rp.id, rp.jenis, k.satker_id, 
            CASE 
                WHEN rp.status IN ('PAID', 'END') THEN 'SUDAH'
                ELSE 'BELUM'
            END
    ) 
    SELECT 
        cte.id, 
        rp1.kegiatan_id,
        k.nama AS kegiatan_nama,
        rp1.mak,
        k.kro,
            COALESCE(rp1.extra_info->>'uraian', k.nama) AS uraian, -- Default to k.nama if uraian is NULL
            cte.jenis, 
            cte.satker_id,
            o.nama satker_nama,
            o.singkatan satker_singkatan,
        k.unit_kerja_id, 
        ou.nama unit_kerja_nama,
        ou.singkatan unit_kerja_singkatan,
            cte.status_pembayaran,
            cte.total,
        cte.pph,
        cte.ppn,
            rp1.status,
        rp1.diajukan_tanggal,
        rp1.diverifikasi_tanggal,
        rp1.dibayar_tanggal,
        pb.nama as ppk_nama
    FROM
        pengajuan_cte cte
    INNER JOIN 
        riwayat_pengajuan rp1 ON cte.id = rp1.id 
    INNER JOIN 
        kegiatan k ON rp1.kegiatan_id = k.id
    INNER JOIN  
    organisasi o ON cte.satker_id = o.id 
	INNER JOIN 
	organisasi ou ON ou.id = k.unit_kerja_id
	INNER JOIN
	pejabat_perbendaharaan pb ON pb.id = rp1.ppk_id
	;
END;
$$ LANGUAGE plpgsql;
