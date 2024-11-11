SELECT distinct status FROM riwayat_pengajuan
WHERE tanggal_mulai >= $1 AND tanggal_selesai <= $2