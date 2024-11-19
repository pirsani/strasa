WITH sp2d_totals AS (
    SELECT
        sd.unit_kerja_id,
        EXTRACT(YEAR FROM sd.tanggal_sp2d) AS year,
        SUM(sd.jumlah_dibayar) AS total_dibayar
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
        COALESCE(st.total_dibayar, 0) AS total_dibayar
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
    pwt.total_dibayar realisasi,
    pwt.pagu,
    (pwt.pagu - pwt.total_dibayar) AS sisa
FROM 
    pagu_with_totals pwt
JOIN 
    organisasi org
ON 
    pwt.unit_kerja_id = org.id
ORDER BY 
    pwt.year, 
    pwt.unit_kerja_id;