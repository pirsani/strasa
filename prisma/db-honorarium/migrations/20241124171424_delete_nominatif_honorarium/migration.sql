/*
  Warnings:

  - You are about to drop the `daftar_nominatif_honorarium` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_extension` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "daftar_nominatif_honorarium" DROP CONSTRAINT "daftar_nominatif_honorarium_jadwal_id_fkey";

-- DropForeignKey
ALTER TABLE "role_extension" DROP CONSTRAINT "role_extension_base_role_id_fkey";

-- DropForeignKey
ALTER TABLE "role_extension" DROP CONSTRAINT "role_extension_extended_role_id_fkey";

-- DropTable
DROP TABLE "daftar_nominatif_honorarium";

-- DropTable
DROP TABLE "role_extension";

-- CreateTable
CREATE TABLE "role_extensions" (
    "id" TEXT NOT NULL,
    "base_role_id" TEXT NOT NULL,
    "extended_role_id" TEXT NOT NULL,

    CONSTRAINT "role_extensions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "role_extensions" ADD CONSTRAINT "role_extensions_base_role_id_fkey" FOREIGN KEY ("base_role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_extensions" ADD CONSTRAINT "role_extensions_extended_role_id_fkey" FOREIGN KEY ("extended_role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
