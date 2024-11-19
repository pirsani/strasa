
-- Create view for Kota Sekitar Jakarta
-- Kota Sekitar Jakarta: Jakarta, Bogor, Depok, Tangerang, Bekasi, Tangerang Selatan, Bogor, Bekasi, Depok, dan kepulauan seribu
-- Kota Sekitar Jakarta: 3216, 3275, 3271, 3276, 3603, 3671, 3674, 3191
-- 3101 adalah kepulauan seribu tambahan data, tidak ada dalam data kota ini di data kemendagri
-- https://disdukcapil.landakkab.go.id/docs/permendagri/attachment428.pdf
CREATE VIEW vkota_sekitar_jakarta AS
SELECT k.id, provinsi_id as "provinsiId", 
p.nama as "provinsiNama",
k.nama
FROM kota k
inner join provinsi p ON p.id = k.provinsi_id 
where k.id in ('3216','3275','3271','3276','3603','3671','3674','3101');

GRANT SELECT ON vkota_sekitar_jakarta TO public;

-- grant select select to user honuserd01
GRANT SELECT ON vkota_sekitar_jakarta TO honuserd01;

-- 2024-11-18
-- Create VIEW untuk dashboard


DROP FUNCTION get_aggregated_payment_status(integer,text);

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

select * from get_aggregated_payment_status(2024,'cm2ds56es0016veofqww3m22p')
