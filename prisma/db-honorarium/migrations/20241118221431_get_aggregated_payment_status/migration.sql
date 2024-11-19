DROP FUNCTION IF EXISTS get_aggregated_payment_status(integer,text);

CREATE OR REPLACE FUNCTION get_aggregated_payment_status(
    p_year INT,
    p_satker_id TEXT
)
RETURNS TABLE (
	unit_kerja_id TEXT,
    nama TEXT,
    singkatan TEXT,
    status_pembayaran TEXT,
    total NUMERIC
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
    	k.unit_kerja_id,
        o.nama,
        o.singkatan,
        CASE 
          WHEN rp.status IN ('PAID', 'END') THEN 'SUDAH'
          ELSE 'BELUM'
        END AS status_pembayaran,
        SUM(
          CASE 
            WHEN rp.jenis = 'HONORARIUM' THEN COALESCE((rp.extra_info->'summedFields'->>'jumlahBruto')::numeric, 0) 
            ELSE COALESCE((rp.extra_info->'summedFields'->>'total')::numeric, 0) 
          END
        ) AS total
    FROM 
        riwayat_pengajuan rp 
    INNER JOIN 
        kegiatan k ON rp.kegiatan_id = k.id
    INNER JOIN  
        organisasi o ON k.unit_kerja_id = o.id 
    WHERE 
        rp.jenis IN ('UH_DALAM_NEGERI', 'UH_LUAR_NEGERI', 'HONORARIUM')
        AND EXTRACT(YEAR FROM k.tanggal_mulai) = p_year
        AND k.satker_id = p_satker_id
    GROUP BY 
        o.nama,
        o.singkatan,
        CASE 
          WHEN rp.status IN ('PAID', 'END') THEN 'SUDAH'
          ELSE 'BELUM'
        END,
        k.unit_kerja_id;
END;
$$ LANGUAGE plpgsql;

-- usage
-- select * from get_aggregated_payment_status(2024,'cm2ds56es0016veofqww3m22p')