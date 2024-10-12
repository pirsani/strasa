# manual query

## enable the uuid-ossp extension in PostgreSQL

```sh
psql -U your_username -d your_database
```

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- verify
\dx
-- usage
SELECT uuid_generate_v4();
```

```sh
sudo -i -u postgres

psql


```

-- Create view for Kota Sekitar Jakarta
-- Kota Sekitar Jakarta: Jakarta, Bogor, Depok, Tangerang, Bekasi, Tangerang Selatan, Bogor, Bekasi, Depok, dan kepulauan seribu
-- Kota Sekitar Jakarta: 3216, 3275, 3271, 3276, 3603, 3671, 3674, 3191
-- 3101 adalah kepulauan seribu tambahan data, tidak ada dalam data kota ini di data kemendagri
-- https://disdukcapil.landakkab.go.id/docs/permendagri/attachment428.pdf

```sql

\c honorarium;

CREATE VIEW vkota_sekitar_jakarta AS
SELECT k.id, provinsi_id as "provinsiId",
p.nama as "provinsiNama",
k.nama
FROM kota k
inner join provinsi p ON p.id = k.provinsi_id
where k.id in ('3216','3275','3271','3276','3603','3671','3674','3101');

GRANT SELECT ON vkota_sekitar_jakarta TO public;

-- grant select select to user honuserd01
GRANT SELECT ON vkota_sekitar_jakarta TO honuserd01;

```
