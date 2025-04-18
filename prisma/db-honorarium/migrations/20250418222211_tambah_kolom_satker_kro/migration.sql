/*
  Warnings:

  - Added the required column `satker_id` to the `kro` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "kro" ADD COLUMN     "satker_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "kro" ADD CONSTRAINT "kro_satker_id_fkey" FOREIGN KEY ("satker_id") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
