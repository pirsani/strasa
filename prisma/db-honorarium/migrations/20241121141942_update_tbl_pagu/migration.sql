/*
  Warnings:

  - A unique constraint covering the columns `[tahun,unit_kerja_id]` on the table `pagu` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "pagu_tahun_unit_kerja_id_key" ON "pagu"("tahun", "unit_kerja_id");
