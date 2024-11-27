-- CreateEnum
CREATE TYPE "TingkatPaketRapat" AS ENUM ('a', 'b', 'c');

-- CreateEnum
CREATE TYPE "LOKASI" AS ENUM ('DALAM_KOTA', 'LUAR_KOTA', 'LUAR_NEGERI');

-- CreateEnum
CREATE TYPE "ALUR_PROSES" AS ENUM ('SETUP', 'PENGAJUAN', 'VERIFIKASI', 'NOMINATIF', 'PEMBAYARAN', 'SELESAI');

-- CreateEnum
CREATE TYPE "JENIS_PENGAJUAN" AS ENUM ('GENERATE_RAMPUNGAN', 'HONORARIUM', 'UH', 'UH_DALAM_NEGERI', 'UH_LUAR_NEGERI', 'PENGGANTIAN_REINBURSEMENT', 'PEMBAYARAN_PIHAK_KETIGA');

-- CreateEnum
CREATE TYPE "STATUS_PENGAJUAN" AS ENUM ('DRAFT', 'SUBMITTED', 'REVISE', 'REVISED', 'VERIFIED', 'APPROVED', 'REQUEST_TO_PAY', 'PAID', 'DONE', 'END');

-- CreateEnum
CREATE TYPE "StatusAktif" AS ENUM ('AKTIF', 'NON_AKTIF', 'DIBUBARKAN');

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_extensions" (
    "id" TEXT NOT NULL,
    "base_role_id" TEXT NOT NULL,
    "extended_role_id" TEXT NOT NULL,

    CONSTRAINT "role_extensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "nip" TEXT,
    "organisasi_id" TEXT,
    "created_by" TEXT NOT NULL DEFAULT 'init',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "user_id" TEXT NOT NULL,
    "theme" TEXT,
    "language" TEXT,
    "tahun_anggaran" INTEGER NOT NULL DEFAULT 2025,
    "extraPreference" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "pangkat_golongan" (
    "id" TEXT NOT NULL,
    "pangkat" TEXT NOT NULL,
    "golongan" TEXT NOT NULL,
    "ruang" TEXT NOT NULL,
    "deskripsi" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pangkat_golongan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "narasumber" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nip" TEXT NOT NULL DEFAULT '-',
    "npwp" TEXT NOT NULL DEFAULT '-',
    "jabatan" TEXT NOT NULL DEFAULT '-',
    "eselon" INTEGER,
    "pangkat_golongan_id" TEXT,
    "jenis_honorarium_id" TEXT,
    "email" TEXT,
    "nomor_telepon" TEXT,
    "bank" TEXT NOT NULL,
    "nama_rekening" TEXT NOT NULL,
    "nomor_rekening" TEXT NOT NULL,
    "dokumen_peryataan_rekening_berbeda" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "narasumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pmk_acuan" (
    "id" TEXT NOT NULL,
    "nomor_pmk" TEXT NOT NULL,
    "tmt_awal" TIMESTAMP(3),
    "tmt_akhir" TIMESTAMP(3),
    "tahun" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pmk_acuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_honorarium" (
    "id" TEXT NOT NULL,
    "kode" TEXT,
    "jenis" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "besaran" DECIMAL(10,0) NOT NULL,
    "uraian" TEXT,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_honorarium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_uh_dalam_negeri" (
    "id" TEXT NOT NULL,
    "provinsi_id" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "fullboard" DECIMAL(10,0) NOT NULL,
    "fullday_halfday" DECIMAL(10,0) NOT NULL,
    "luar_kota" DECIMAL(10,0) NOT NULL,
    "dalam_kota" DECIMAL(10,0) NOT NULL,
    "diklat" DECIMAL(10,0) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_uh_dalam_negeri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_rapat" (
    "id" TEXT NOT NULL,
    "provinsi_id" TEXT NOT NULL,
    "tingkat" "TingkatPaketRapat" NOT NULL,
    "halfday" DECIMAL(10,0) NOT NULL,
    "fullday" DECIMAL(10,0) NOT NULL,
    "fullboard" DECIMAL(10,0) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_rapat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_uh_rapat" (
    "id" TEXT NOT NULL,
    "provinsi_id" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "fullboard" DECIMAL(10,0) NOT NULL,
    "fullday_halfday" DECIMAL(10,0) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_uh_rapat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_taksi" (
    "id" TEXT NOT NULL,
    "provinsi_id" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "besaran" DECIMAL(10,0) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_taksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_transpor_dalam_kota_pulang_pergi" (
    "id" TEXT NOT NULL,
    "besaran" DECIMAL(10,0) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_transpor_dalam_kota_pulang_pergi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_transpor_jakarta_ke_kota_kab_sekitar" (
    "id" TEXT NOT NULL,
    "kota_id" TEXT NOT NULL,
    "besaran" DECIMAL(10,0) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_transpor_jakarta_ke_kota_kab_sekitar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_transpor_ibukota_ke_kota_kab" (
    "id" TEXT NOT NULL,
    "ibukota_id" TEXT NOT NULL,
    "kota_id" TEXT NOT NULL,
    "besaran" DECIMAL(10,0) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_transpor_ibukota_ke_kota_kab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kota" (
    "id" TEXT NOT NULL,
    "provinsi_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "kota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_tiket_pesawat" (
    "id" TEXT NOT NULL,
    "kota_asal_id" TEXT NOT NULL,
    "kota_tujuan_id" TEXT NOT NULL,
    "tiket_bisnis" DECIMAL(10,0) NOT NULL,
    "tiket_ekonomi" DECIMAL(10,0) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_tiket_pesawat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_tiket_pesawat_luar_negeri" (
    "id" TEXT NOT NULL,
    "kota_asal_id" INTEGER NOT NULL,
    "negara_id" TEXT NOT NULL,
    "tiket_eksekutif" DECIMAL(5,0) NOT NULL,
    "tiket_bisnis" DECIMAL(5,0) NOT NULL,
    "tiket_ekonomi" DECIMAL(5,0) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_tiket_pesawat_luar_negeri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_uh_luar_negeri" (
    "id" TEXT NOT NULL,
    "negara_id" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "golongan_a" DECIMAL(4,0) NOT NULL,
    "golongan_b" DECIMAL(4,0) NOT NULL,
    "golongan_c" DECIMAL(4,0) NOT NULL,
    "golongan_d" DECIMAL(4,0) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_uh_luar_negeri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbm_uang_representasi" (
    "id" TEXT NOT NULL,
    "pejabat_id" INTEGER NOT NULL,
    "satuan" TEXT NOT NULL,
    "luar_kota" INTEGER NOT NULL,
    "dalam_kota" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sbm_uang_representasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pejabat" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "eselon" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL DEFAULT 'init',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pejabat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kegiatan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_selesai" TIMESTAMP(3) NOT NULL,
    "dokumen_nodin_memo_sk" TEXT NOT NULL,
    "dokumen_jadwal" TEXT NOT NULL,
    "lokasi" "LOKASI" NOT NULL,
    "provinsi_id" TEXT,
    "kota" TEXT,
    "keterangan" TEXT,
    "status" TEXT NOT NULL,
    "satker_id" TEXT NOT NULL,
    "unit_kerja_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "bendahara_id" TEXT,
    "ppk_id" TEXT,
    "kpa_id" TEXT,

    CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen_surat_tugas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "dokumen" TEXT NOT NULL,
    "kegiatan_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "dokumen_surat_tugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peserta_kegiatan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nip" TEXT,
    "nik" TEXT NOT NULL,
    "npwp" TEXT,
    "pangkat_golongan_id" TEXT,
    "jabatan" TEXT,
    "eselon" TEXT,
    "golongan_uh_luar_negeri" TEXT,
    "tanggal_berangkat" TIMESTAMP(3),
    "tanggal_kembali" TIMESTAMP(3),
    "email" TEXT,
    "telp" TEXT,
    "rekening_sendiri" BOOLEAN NOT NULL DEFAULT true,
    "dokumen_peryataan_rekening_berbeda" TEXT,
    "bank" TEXT NOT NULL,
    "nama_rekening" TEXT NOT NULL,
    "nomor_rekening" TEXT NOT NULL,
    "kegiatan_id" TEXT NOT NULL,
    "jumlah_hari" INTEGER DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "peserta_kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uh_dalam_negeri" (
    "id" SERIAL NOT NULL,
    "peserta_kegiatan_id" TEXT NOT NULL,
    "jumlah_hari" INTEGER NOT NULL DEFAULT 0,
    "h_fullboard" INTEGER NOT NULL DEFAULT 0,
    "h_fullday_halfday" INTEGER NOT NULL DEFAULT 0,
    "h_luar_kota" INTEGER NOT NULL DEFAULT 0,
    "h_dalam_kota" INTEGER NOT NULL DEFAULT 0,
    "h_diklat" INTEGER NOT NULL DEFAULT 0,
    "h_transport" INTEGER NOT NULL DEFAULT 0,
    "uh_fullboard" INTEGER NOT NULL DEFAULT 0,
    "uh_fullday_halfday" INTEGER NOT NULL DEFAULT 0,
    "uh_luar_kota" INTEGER NOT NULL DEFAULT 0,
    "uh_dalam_kota" INTEGER NOT NULL DEFAULT 0,
    "uh_diklat" INTEGER NOT NULL DEFAULT 0,
    "uh_transport" INTEGER NOT NULL DEFAULT 0,
    "dokumen_bukti_pembayaran" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "uh_dalam_negeri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uh_luar_negeri" (
    "id" SERIAL NOT NULL,
    "peserta_kegiatan_id" TEXT NOT NULL,
    "dari_lokasi_id" TEXT NOT NULL,
    "ke_lokasi_id" TEXT NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_tiba" TIMESTAMP(3) NOT NULL,
    "tanggal_selesai" TIMESTAMP(3) NOT NULL,
    "jumlah_hari" INTEGER NOT NULL DEFAULT 0,
    "sbm_uh_luar_negeri_id" TEXT,
    "golongan_uh" TEXT,
    "nominal_golongan_uh" INTEGER DEFAULT 0,
    "jam_perjalanan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "h_perjalanan" INTEGER NOT NULL DEFAULT 0,
    "uh_perjalanan" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "h_uang_harian" INTEGER NOT NULL DEFAULT 0,
    "uh_uang_harian" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "h_diklat" INTEGER NOT NULL DEFAULT 0,
    "uh_diklat" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "kurs" INTEGER DEFAULT 0,
    "dokumen_bukti_pembayaran" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "uh_luar_negeri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary" (
    "id" TEXT NOT NULL,
    "sbm_uh_luar_negeri_id" TEXT,
    "dariLokasiId" TEXT NOT NULL,
    "keLokasiId" TEXT NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_tiba" TIMESTAMP(3) NOT NULL,
    "tanggal_selesai" TIMESTAMP(3) NOT NULL,
    "kegiatan_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spd" (
    "id" TEXT NOT NULL,
    "nomor_spd" TEXT NOT NULL,
    "tanggal_spd" TIMESTAMP(3) NOT NULL,
    "as_was" JSONB,
    "dokumen" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "kegiatan_id" TEXT NOT NULL,

    CONSTRAINT "spd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_pengajuan" (
    "id" TEXT NOT NULL,
    "jenis" "JENIS_PENGAJUAN" NOT NULL,
    "kegiatan_id" TEXT NOT NULL,
    "status" "STATUS_PENGAJUAN" NOT NULL,
    "diajukan_tanggal" TIMESTAMP(3) NOT NULL,
    "diverifikasi_tanggal" TIMESTAMP(3),
    "disetujui_tanggal" TIMESTAMP(3),
    "diminta_pembayaran_tanggal" TIMESTAMP(3),
    "dibayar_tanggal" TIMESTAMP(3),
    "diselesaikan_tanggal" TIMESTAMP(3),
    "diajukan_oleh_id" TEXT NOT NULL,
    "diverifikasi_oleh_id" TEXT,
    "disetujui_oleh_id" TEXT,
    "pengajuan_permintaan_pembayaran_oleh_id" TEXT,
    "dibayar_oleh_id" TEXT,
    "diselesaikan_oleh_id" TEXT,
    "catatan_revisi" TEXT,
    "catatan_permintaan_pembayaran" TEXT,
    "ppk_id" TEXT,
    "bendahara_id" TEXT,
    "dokumen_nominatif" TEXT,
    "dokumen_bukti_pajak" TEXT,
    "dokumen_bukti_pembayaran" TEXT,
    "dokumentasi" TEXT,
    "dokumen_laporan_kegiatan" TEXT,
    "jumlah_perkiraan_pembayaran" INTEGER DEFAULT 0,
    "jumlah_permintaan_pembayaran" INTEGER DEFAULT 0,
    "jumlah_pembayaran" INTEGER DEFAULT 0,
    "jumlah_pembulatan" INTEGER DEFAULT 0,
    "extra_info" JSONB,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "riwayat_pengajuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_proses" (
    "id" TEXT NOT NULL,
    "proses" "ALUR_PROSES",
    "jenis" "JENIS_PENGAJUAN" NOT NULL,
    "status" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "tgl_status" TIMESTAMP(3) NOT NULL,
    "kegiatan_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "log_proses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "kegiatan_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materi" (
    "id" TEXT NOT NULL,
    "kode" TEXT,
    "nama" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "materi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal" (
    "id" TEXT NOT NULL,
    "kegiatan_id" TEXT NOT NULL,
    "materi_id" TEXT NOT NULL,
    "kelas_id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jam_mulai" TIMESTAMP(3),
    "jam_selesai" TIMESTAMP(3),
    "ruang" TEXT,
    "jumlah_jam_pelajaran" DECIMAL(5,2),
    "dokumen_undangan_narasumber" TEXT,
    "dokumen_konfirmasi_kesediaan_mengajar" TEXT,
    "dokumen_daftar_hadir" TEXT,
    "dokumen_jadwal_kegiatan" TEXT,
    "tautan_material" TEXT,
    "riwayat_pengajuan_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "pejabatPerbendaharaanId" TEXT,

    CONSTRAINT "jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal_narasumber" (
    "id" TEXT NOT NULL,
    "jadwal_id" TEXT NOT NULL,
    "narasumber_id" TEXT NOT NULL,
    "as_was" JSONB,
    "jenis_honorarium_id" TEXT,
    "besaran_honorarium" DECIMAL(10,0),
    "jumlah_jam_pelajaran" DECIMAL(5,2),
    "dokumen_konfirmasi_kesediaan_mengajar" TEXT,
    "pajak_dpp" DECIMAL(10,0),
    "pajak_tarif" DECIMAL(5,2),
    "pph_21" DECIMAL(10,2),
    "jumlah_diterima" DECIMAL(10,2),
    "dokumen_bukti_pajak" TEXT,
    "dokumen_bukti_pembayaran" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "jadwal_narasumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_dokumen_kegiatan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "untuk_langkah_ke" INTEGER NOT NULL DEFAULT 0,
    "untuk_lokasi_di" TEXT NOT NULL DEFAULT '0;1',
    "is_multiple" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "jenis_dokumen_kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen_kegiatan" (
    "id" TEXT NOT NULL,
    "dokumen" TEXT NOT NULL,
    "kegiatan_id" TEXT NOT NULL,
    "nama" TEXT,
    "jenis_dokumen_id" TEXT,
    "original_filename" TEXT,
    "file_path" TEXT,
    "mime_type" TEXT,
    "encoding" TEXT,
    "notes" TEXT,
    "hash" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dokumen_kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id" TEXT NOT NULL,
    "kegiatan_id" TEXT NOT NULL,
    "satker_id" TEXT NOT NULL,
    "map_to" TEXT NOT NULL,
    "mapped_id" TEXT NOT NULL,
    "dokumen_bukti_pajak" TEXT NOT NULL,
    "bendahara_id" TEXT NOT NULL,
    "jenisPengajuan" "JENIS_PENGAJUAN" NOT NULL,
    "status" TEXT NOT NULL,
    "ppk_id" TEXT NOT NULL,
    "pejabatPerbendaharaanId" TEXT,
    "catatan" TEXT,
    "dibayar_oleh_id" TEXT,
    "tanggal_pembayaran" TIMESTAMP(3),
    "asWas" JSONB,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinsi" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "urutan" SERIAL,
    "singkatan" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL DEFAULT 'init',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "provinsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negara" (
    "id" TEXT NOT NULL,
    "urutan" INTEGER,
    "nama" TEXT NOT NULL,
    "nama_inggris" TEXT NOT NULL,
    "kode_alpha_2" TEXT NOT NULL,
    "kode_alpha_3" TEXT NOT NULL,
    "kode_numeric" TEXT NOT NULL,
    "created_by" TEXT NOT NULL DEFAULT 'init',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "negara_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisasi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "singkatan" TEXT,
    "status" "StatusAktif" NOT NULL DEFAULT 'AKTIF',
    "eselon" INTEGER,
    "is_satker_anggaran" BOOLEAN DEFAULT false,
    "anggaran_satker_id" TEXT,
    "induk_organisasi_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_jabatan_perbendaharaan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "singkatan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "jenis_jabatan_perbendaharaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pejabat_perbendaharaan" (
    "id" TEXT NOT NULL,
    "nik" TEXT,
    "nama" TEXT NOT NULL,
    "nip" TEXT,
    "pangkat_golongan_id" TEXT,
    "jabatan_id" TEXT NOT NULL,
    "satker_id" TEXT NOT NULL,
    "tmt_mulai" TIMESTAMP(3) NOT NULL,
    "tmt_selesai" TIMESTAMP(3),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pejabat_perbendaharaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploaded_file" (
    "id" TEXT NOT NULL,
    "rereferensi_id" TEXT,
    "rereferensi_table" TEXT,
    "keterangan" TEXT,
    "original_filename" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mime_type" TEXT,
    "encoding" TEXT,
    "notes" TEXT,
    "hash" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagu" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "unit_kerja_id" TEXT NOT NULL,
    "pagu" BIGINT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pagu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sp2d" (
    "id" TEXT NOT NULL,
    "nomor_sp2d" TEXT NOT NULL,
    "tanggal_sp2d" TIMESTAMP(3) NOT NULL,
    "jumlah_diminta" BIGINT NOT NULL DEFAULT 0,
    "jumlah_potongan" BIGINT NOT NULL DEFAULT 0,
    "jumlah_dibayar" BIGINT NOT NULL DEFAULT 0,
    "dokumen" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "unit_kerja_id" TEXT NOT NULL,

    CONSTRAINT "sp2d_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "pangkat_golongan_golongan_ruang_key" ON "pangkat_golongan"("golongan", "ruang");

-- CreateIndex
CREATE UNIQUE INDEX "pmk_acuan_nomor_pmk_key" ON "pmk_acuan"("nomor_pmk");

-- CreateIndex
CREATE UNIQUE INDEX "sbm_honorarium_kode_tahun_key" ON "sbm_honorarium"("kode", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "sbm_uh_dalam_negeri_provinsi_id_tahun_key" ON "sbm_uh_dalam_negeri"("provinsi_id", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "sbm_rapat_provinsi_id_tingkat_tahun_key" ON "sbm_rapat"("provinsi_id", "tingkat", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "sbm_taksi_provinsi_id_tahun_key" ON "sbm_taksi"("provinsi_id", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "sbm_transpor_dalam_kota_pulang_pergi_tahun_key" ON "sbm_transpor_dalam_kota_pulang_pergi"("tahun");

-- CreateIndex
CREATE UNIQUE INDEX "sbm_transpor_jakarta_ke_kota_kab_sekitar_kota_id_tahun_key" ON "sbm_transpor_jakarta_ke_kota_kab_sekitar"("kota_id", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "sbm_transpor_ibukota_ke_kota_kab_ibukota_id_kota_id_tahun_key" ON "sbm_transpor_ibukota_ke_kota_kab"("ibukota_id", "kota_id", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "sbm_tiket_pesawat_kota_asal_id_kota_tujuan_id_tahun_key" ON "sbm_tiket_pesawat"("kota_asal_id", "kota_tujuan_id", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "sbm_uh_luar_negeri_negara_id_tahun_key" ON "sbm_uh_luar_negeri"("negara_id", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "sbm_uang_representasi_pejabat_id_tahun_key" ON "sbm_uang_representasi"("pejabat_id", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_kegiatan_kegiatan_id_nik_key" ON "peserta_kegiatan"("kegiatan_id", "nik");

-- CreateIndex
CREATE UNIQUE INDEX "uh_dalam_negeri_peserta_kegiatan_id_key" ON "uh_dalam_negeri"("peserta_kegiatan_id");

-- CreateIndex
CREATE UNIQUE INDEX "uh_luar_negeri_peserta_kegiatan_id_dari_lokasi_id_ke_lokasi_key" ON "uh_luar_negeri"("peserta_kegiatan_id", "dari_lokasi_id", "ke_lokasi_id", "tanggal_mulai", "tanggal_selesai");

-- CreateIndex
CREATE UNIQUE INDEX "spd_nomor_spd_key" ON "spd"("nomor_spd");

-- CreateIndex
CREATE UNIQUE INDEX "spd_kegiatan_id_key" ON "spd"("kegiatan_id");

-- CreateIndex
CREATE UNIQUE INDEX "kelas_kode_key" ON "kelas"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "jadwal_narasumber_jadwal_id_narasumber_id_key" ON "jadwal_narasumber"("jadwal_id", "narasumber_id");

-- CreateIndex
CREATE UNIQUE INDEX "negara_kode_alpha_2_key" ON "negara"("kode_alpha_2");

-- CreateIndex
CREATE UNIQUE INDEX "negara_kode_alpha_3_key" ON "negara"("kode_alpha_3");

-- CreateIndex
CREATE UNIQUE INDEX "negara_kode_numeric_key" ON "negara"("kode_numeric");

-- CreateIndex
CREATE UNIQUE INDEX "pagu_tahun_unit_kerja_id_key" ON "pagu"("tahun", "unit_kerja_id");

-- CreateIndex
CREATE UNIQUE INDEX "sp2d_nomor_sp2d_key" ON "sp2d"("nomor_sp2d");

-- AddForeignKey
ALTER TABLE "role_extensions" ADD CONSTRAINT "role_extensions_base_role_id_fkey" FOREIGN KEY ("base_role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_extensions" ADD CONSTRAINT "role_extensions_extended_role_id_fkey" FOREIGN KEY ("extended_role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "narasumber" ADD CONSTRAINT "narasumber_pangkat_golongan_id_fkey" FOREIGN KEY ("pangkat_golongan_id") REFERENCES "pangkat_golongan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "narasumber" ADD CONSTRAINT "narasumber_jenis_honorarium_id_fkey" FOREIGN KEY ("jenis_honorarium_id") REFERENCES "sbm_honorarium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_uh_dalam_negeri" ADD CONSTRAINT "sbm_uh_dalam_negeri_provinsi_id_fkey" FOREIGN KEY ("provinsi_id") REFERENCES "provinsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_rapat" ADD CONSTRAINT "sbm_rapat_provinsi_id_fkey" FOREIGN KEY ("provinsi_id") REFERENCES "provinsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_uh_rapat" ADD CONSTRAINT "sbm_uh_rapat_provinsi_id_fkey" FOREIGN KEY ("provinsi_id") REFERENCES "provinsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_taksi" ADD CONSTRAINT "sbm_taksi_provinsi_id_fkey" FOREIGN KEY ("provinsi_id") REFERENCES "provinsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_transpor_jakarta_ke_kota_kab_sekitar" ADD CONSTRAINT "sbm_transpor_jakarta_ke_kota_kab_sekitar_kota_id_fkey" FOREIGN KEY ("kota_id") REFERENCES "kota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_transpor_ibukota_ke_kota_kab" ADD CONSTRAINT "sbm_transpor_ibukota_ke_kota_kab_ibukota_id_fkey" FOREIGN KEY ("ibukota_id") REFERENCES "kota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_transpor_ibukota_ke_kota_kab" ADD CONSTRAINT "sbm_transpor_ibukota_ke_kota_kab_kota_id_fkey" FOREIGN KEY ("kota_id") REFERENCES "kota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kota" ADD CONSTRAINT "kota_provinsi_id_fkey" FOREIGN KEY ("provinsi_id") REFERENCES "provinsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_tiket_pesawat" ADD CONSTRAINT "sbm_tiket_pesawat_kota_asal_id_fkey" FOREIGN KEY ("kota_asal_id") REFERENCES "kota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_tiket_pesawat" ADD CONSTRAINT "sbm_tiket_pesawat_kota_tujuan_id_fkey" FOREIGN KEY ("kota_tujuan_id") REFERENCES "kota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_tiket_pesawat_luar_negeri" ADD CONSTRAINT "sbm_tiket_pesawat_luar_negeri_negara_id_fkey" FOREIGN KEY ("negara_id") REFERENCES "negara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_uh_luar_negeri" ADD CONSTRAINT "sbm_uh_luar_negeri_negara_id_fkey" FOREIGN KEY ("negara_id") REFERENCES "negara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbm_uang_representasi" ADD CONSTRAINT "sbm_uang_representasi_pejabat_id_fkey" FOREIGN KEY ("pejabat_id") REFERENCES "pejabat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_provinsi_id_fkey" FOREIGN KEY ("provinsi_id") REFERENCES "provinsi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_satker_id_fkey" FOREIGN KEY ("satker_id") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_unit_kerja_id_fkey" FOREIGN KEY ("unit_kerja_id") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_bendahara_id_fkey" FOREIGN KEY ("bendahara_id") REFERENCES "pejabat_perbendaharaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_ppk_id_fkey" FOREIGN KEY ("ppk_id") REFERENCES "pejabat_perbendaharaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_kpa_id_fkey" FOREIGN KEY ("kpa_id") REFERENCES "pejabat_perbendaharaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_surat_tugas" ADD CONSTRAINT "dokumen_surat_tugas_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_kegiatan" ADD CONSTRAINT "peserta_kegiatan_pangkat_golongan_id_fkey" FOREIGN KEY ("pangkat_golongan_id") REFERENCES "pangkat_golongan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_kegiatan" ADD CONSTRAINT "peserta_kegiatan_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uh_dalam_negeri" ADD CONSTRAINT "uh_dalam_negeri_peserta_kegiatan_id_fkey" FOREIGN KEY ("peserta_kegiatan_id") REFERENCES "peserta_kegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uh_luar_negeri" ADD CONSTRAINT "uh_luar_negeri_peserta_kegiatan_id_fkey" FOREIGN KEY ("peserta_kegiatan_id") REFERENCES "peserta_kegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uh_luar_negeri" ADD CONSTRAINT "uh_luar_negeri_dari_lokasi_id_fkey" FOREIGN KEY ("dari_lokasi_id") REFERENCES "negara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uh_luar_negeri" ADD CONSTRAINT "uh_luar_negeri_ke_lokasi_id_fkey" FOREIGN KEY ("ke_lokasi_id") REFERENCES "negara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uh_luar_negeri" ADD CONSTRAINT "uh_luar_negeri_sbm_uh_luar_negeri_id_fkey" FOREIGN KEY ("sbm_uh_luar_negeri_id") REFERENCES "sbm_uh_luar_negeri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_sbm_uh_luar_negeri_id_fkey" FOREIGN KEY ("sbm_uh_luar_negeri_id") REFERENCES "sbm_uh_luar_negeri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_dariLokasiId_fkey" FOREIGN KEY ("dariLokasiId") REFERENCES "negara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_keLokasiId_fkey" FOREIGN KEY ("keLokasiId") REFERENCES "negara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spd" ADD CONSTRAINT "spd_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan" ADD CONSTRAINT "riwayat_pengajuan_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan" ADD CONSTRAINT "riwayat_pengajuan_diajukan_oleh_id_fkey" FOREIGN KEY ("diajukan_oleh_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan" ADD CONSTRAINT "riwayat_pengajuan_diverifikasi_oleh_id_fkey" FOREIGN KEY ("diverifikasi_oleh_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan" ADD CONSTRAINT "riwayat_pengajuan_disetujui_oleh_id_fkey" FOREIGN KEY ("disetujui_oleh_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan" ADD CONSTRAINT "riwayat_pengajuan_pengajuan_permintaan_pembayaran_oleh_id_fkey" FOREIGN KEY ("pengajuan_permintaan_pembayaran_oleh_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan" ADD CONSTRAINT "riwayat_pengajuan_dibayar_oleh_id_fkey" FOREIGN KEY ("dibayar_oleh_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan" ADD CONSTRAINT "riwayat_pengajuan_diselesaikan_oleh_id_fkey" FOREIGN KEY ("diselesaikan_oleh_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan" ADD CONSTRAINT "riwayat_pengajuan_ppk_id_fkey" FOREIGN KEY ("ppk_id") REFERENCES "pejabat_perbendaharaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pengajuan" ADD CONSTRAINT "riwayat_pengajuan_bendahara_id_fkey" FOREIGN KEY ("bendahara_id") REFERENCES "pejabat_perbendaharaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_proses" ADD CONSTRAINT "log_proses_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_proses" ADD CONSTRAINT "log_proses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_proses" ADD CONSTRAINT "log_proses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_materi_id_fkey" FOREIGN KEY ("materi_id") REFERENCES "materi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_riwayat_pengajuan_id_fkey" FOREIGN KEY ("riwayat_pengajuan_id") REFERENCES "riwayat_pengajuan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_pejabatPerbendaharaanId_fkey" FOREIGN KEY ("pejabatPerbendaharaanId") REFERENCES "pejabat_perbendaharaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_narasumber" ADD CONSTRAINT "jadwal_narasumber_jadwal_id_fkey" FOREIGN KEY ("jadwal_id") REFERENCES "jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_narasumber" ADD CONSTRAINT "jadwal_narasumber_narasumber_id_fkey" FOREIGN KEY ("narasumber_id") REFERENCES "narasumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_narasumber" ADD CONSTRAINT "jadwal_narasumber_jenis_honorarium_id_fkey" FOREIGN KEY ("jenis_honorarium_id") REFERENCES "sbm_honorarium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_kegiatan" ADD CONSTRAINT "dokumen_kegiatan_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_kegiatan" ADD CONSTRAINT "dokumen_kegiatan_jenis_dokumen_id_fkey" FOREIGN KEY ("jenis_dokumen_id") REFERENCES "jenis_dokumen_kegiatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_satker_id_fkey" FOREIGN KEY ("satker_id") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_bendahara_id_fkey" FOREIGN KEY ("bendahara_id") REFERENCES "pejabat_perbendaharaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_ppk_id_fkey" FOREIGN KEY ("ppk_id") REFERENCES "pejabat_perbendaharaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisasi" ADD CONSTRAINT "organisasi_anggaran_satker_id_fkey" FOREIGN KEY ("anggaran_satker_id") REFERENCES "organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisasi" ADD CONSTRAINT "organisasi_induk_organisasi_id_fkey" FOREIGN KEY ("induk_organisasi_id") REFERENCES "organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pejabat_perbendaharaan" ADD CONSTRAINT "pejabat_perbendaharaan_pangkat_golongan_id_fkey" FOREIGN KEY ("pangkat_golongan_id") REFERENCES "pangkat_golongan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pejabat_perbendaharaan" ADD CONSTRAINT "pejabat_perbendaharaan_jabatan_id_fkey" FOREIGN KEY ("jabatan_id") REFERENCES "jenis_jabatan_perbendaharaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pejabat_perbendaharaan" ADD CONSTRAINT "pejabat_perbendaharaan_satker_id_fkey" FOREIGN KEY ("satker_id") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagu" ADD CONSTRAINT "pagu_unit_kerja_id_fkey" FOREIGN KEY ("unit_kerja_id") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sp2d" ADD CONSTRAINT "sp2d_unit_kerja_id_fkey" FOREIGN KEY ("unit_kerja_id") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
