DROP FUNCTION IF EXISTS get_pagu_realisasi(integer,text);

CREATE OR REPLACE FUNCTION get_pagu_realisasi(
    p_year INT,
    p_satker_id TEXT
)
RETURNS TABLE (
    year INT,
    unit_kerja_id TEXT,
    nama TEXT,
    singkatan TEXT,
    realisasi BIGINT,
    pagu BIGINT,
    sisa BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH sp2d_totals AS (
        SELECT
            sd.unit_kerja_id,
            EXTRACT(YEAR FROM sd.tanggal_sp2d) AS year,
            SUM(sd.jumlah_dibayar)::BIGINT AS total_dibayar
        FROM 
            sp2d sd
        GROUP BY 
            sd.unit_kerja_id, 
            EXTRACT(YEAR FROM sd.tanggal_sp2d)
    ),
    pagu_with_totals AS (
        SELECT
            pg.tahun AS year,
            pg.unit_kerja_id,
            pg.pagu,
            COALESCE(st.total_dibayar, 0)::BIGINT AS total_dibayar
        FROM 
            pagu pg
        LEFT JOIN 
            sp2d_totals st 
        ON 
            pg.unit_kerja_id = st.unit_kerja_id
            AND pg.tahun = st.year
    )
    SELECT
        pwt.year,
        pwt.unit_kerja_id,
        org.nama,
        org.singkatan,
        pwt.total_dibayar AS realisasi,
        pwt.pagu,
        (pwt.pagu - pwt.total_dibayar) AS sisa
    FROM 
        pagu_with_totals pwt
    JOIN 
        organisasi org
    ON 
        pwt.unit_kerja_id = org.id
    WHERE 
        pwt.year = p_year
        AND org.induk_organisasi_id = p_satker_id
    ORDER BY 
        pwt.year, 
        pwt.unit_kerja_id;
END;
$$ LANGUAGE plpgsql;

-- USAGE EXAMPLE
-- select * from get_pagu_realisasi(2024,'cm2btc0ro0016cazwuqcaunam')


