-- CreateTable
CREATE TABLE "kro" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "kro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peserta" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nip" TEXT,
    "nik" TEXT NOT NULL,
    "npwp" TEXT,
    "pangkat_golongan_id" TEXT,
    "jabatan" TEXT,
    "eselon" TEXT,
    "golongan_uh_luar_negeri" TEXT,
    "email" TEXT,
    "telp" TEXT,
    "rekening_sendiri" BOOLEAN NOT NULL DEFAULT true,
    "dokumen_peryataan_rekening_berbeda" TEXT,
    "bank" TEXT NOT NULL,
    "nama_rekening" TEXT NOT NULL,
    "nomor_rekening" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "peserta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kro_kode_tahun_key" ON "kro"("kode", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_nik_key" ON "peserta"("nik");

-- AddForeignKey
ALTER TABLE "peserta" ADD CONSTRAINT "peserta_pangkat_golongan_id_fkey" FOREIGN KEY ("pangkat_golongan_id") REFERENCES "pangkat_golongan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
