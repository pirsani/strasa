-- AlterTable
ALTER TABLE "provinsi" ALTER COLUMN "urutan" DROP NOT NULL;

-- Create view for Kota Sekitar Jakarta
-- Kota Sekitar Jakarta: Jakarta, Bogor, Depok, Tangerang, Bekasi, Tangerang Selatan, Bogor, Bekasi, Depok, dan kepulauan seribu
-- Kota Sekitar Jakarta: 3216, 3275, 3271, 3276, 3603, 3671, 3674, 3191
-- 3101 adalah kepulauan seribu tambahan data, tidak ada dalam data kota ini di data kemendagri
-- https://disdukcapil.landakkab.go.id/docs/permendagri/attachment428.pdf

DROP VIEW IF EXISTS vkota_sekitar_jakarta;

CREATE VIEW vkota_sekitar_jakarta AS
SELECT k.id, provinsi_id as "provinsiId", 
p.nama as "provinsiNama",
k.nama
FROM kota k
inner join provinsi p ON p.id = k.provinsi_id 
where k.id in ('3216','3275','3271','3276','3603','3671','3674','3101');