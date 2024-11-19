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
CREATE UNIQUE INDEX "sp2d_nomor_sp2d_key" ON "sp2d"("nomor_sp2d");

-- AddForeignKey
ALTER TABLE "sp2d" ADD CONSTRAINT "sp2d_unit_kerja_id_fkey" FOREIGN KEY ("unit_kerja_id") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
