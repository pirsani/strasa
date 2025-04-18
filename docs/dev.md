# dev

## installation

### UI shadcn

ref: <https://ui.shadcn.com/docs/installation/next>

```sh
pnpm create next-app@latest honorarium --typescript --tailwind --eslint

pnpm dlx shadcn-ui@latest init

pnpm dlx shadcn-ui@latest add alert-dialog avatar badge breadcrumb button calendar card checkbox collapsible dialog dropdown-menu form input label navigation-menu pagination popover progress scroll-area separator sheet skeleton sonner switch table @tanstack/react-table tabs textarea toast tooltip
```

### ORM Prisma ORM

```sh
pnpm add ts-node prisma -D
pnpm prisma init
```

modify prisma

```sh
mkdir prisma/db-honorarium
mv prisma/schema.prisma prisma/db-honorarium/schema.prisma
```

create database docker

```yml
services:
  postgres:
    container_name: postgres-honorarium
    image: postgres:alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /data/postgres
    volumes:
      - ./volumes/data/postgres:/data/postgres
      - ./volumes/data/backups:/backups
    ports:
      - "5454:5432" # use free port
    networks:
      - postgres
    restart: unless-stopped
networks:
  postgres:
    driver: bridge
```

run docker

```sh
docker compose up -d
```

notes:
Later we must specify user for better security

### set .env

### update schema.prisma

- update schema
- push to database

```sh
# pnpm prisma db pull --schema=./prisma/db-honorarium/schema.prisma
pnpm prisma db push --schema=./prisma/db-honorarium/schema.prisma
pnpm prisma generate --schema=./prisma/db-honorarium/schema.prisma
# pnpm prisma migrate dev --schema=./prisma/db-honorarium/schema.prisma
# pnpm prisma migrate dev --schema=./prisma/db-honorarium/schema.prisma --create-only
# pnpm prisma migrate reset --schema=./prisma/db-honorarium/schema.prisma
```

updated:

```json
{
  "scripts": {
    "prisma:db-push": "DATABASE_URL=${DATABASE_URL_ADMIN} pnpm prisma db push --schema=./prisma/db-honorarium/schema.prisma",
    "prisma:generate": "DATABASE_URL=${DATABASE_URL_ADMIN} pnpm prisma generate --schema=./prisma/db-honorarium/schema.prisma"
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

```sh
pnpm run prisma:db-push
pnpm run prisma:generate

```

```sh
pnpm run prisma:baseline
pnpm run prisma:deploy
```

## UI

### install zustand for state management

```sh
pnpm add zustand
pnpm add lodash
pnpm add -D @types/lodash
```

### WARNING DO NOT DO IT IF YOU NOT AWARE OF WHAT YOU ARE DOIN

```sh
pnpm prisma migrate diff \
--from-empty \
--to-schema-datamodel prisma/db-honorarium/schema.prisma \
--script > prisma/db-honorarium/migrations/0_init/migration.sql

pnpm prisma migrate resolve --applied 0_init --schema=./prisma/db-honorarium/schema.prisma
```

```sh
pnpm prisma migrate reset --schema=./prisma/db-honorarium/schema.prisma
```

```sh
pnpm prisma migrate dev --create-only --name init --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name get_aggregated_payment_status --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name sp2d --schema=./prisma/db-honorarium/schema.prisma


pnpm prisma migrate dev --create-only --name get_pagu_realisasi --schema=./prisma/db-honorarium/schema.prisma


pnpm prisma migrate dev --create-only --name update_tbl_pagu --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name redis_prep --schema=./prisma/db-honorarium/schema.prisma


pnpm prisma migrate deploy --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name rename_tbl_role_extension --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name delete_NominatifHonorarium --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name opsionalBuktiPajak --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name tambah_kolom_mak_kro --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name inputBuktiBayarTanggal --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name get_riwayat_pengajuan_payment_status --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name tambah_kolom_dokumen_lainnya --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate dev --create-only --name model_baru_kro_peserta --schema=./prisma/db-honorarium/schema.prisma

pnpm prisma migrate deploy --schema=./prisma/db-honorarium/schema.prisma

-- pnpm prisma migrate resolve --applied "20241216221436_input_bukti_bayar_tanggal" --schema=./prisma/db-honorarium/schema.prisma

-- pnpm prisma migrate resolve --applied "20241216183121_get_riwayat_pengajuan_payment_status" --schema=./prisma/db-honorarium/schema.prisma

pnpm run prisma:generate

# pnpm prisma migrate dev --schema=./prisma/db-honorarium/schema.prisma
```

```sh
pnpm prisma migrate resolve --rolled-back "20241122102707_redis_prep" --schema=./prisma/db-honorarium/schema.prisma
```

## NOTES

During development if the failed migration(s) have not been deployed to a production database you can then fix the migration(s) and run prisma migrate dev.

The failed migration(s) can be marked as rolled back or applied:

- If you rolled back the migration(s) manually:
  prisma migrate resolve --rolled-back "20241122102707_redis_prep"

- If you fixed the database manually (hotfix):
  prisma migrate resolve --applied "20241122102707_redis_prep"

<https://echobind.com/post/make-prisma-ignore-a-migration-change>

```sh
shasum -a 256 prisma/migrations/20220510001642_my_migration/migration.sql
```

```PS
Get-FileHash -Algorithm SHA256 .\prisma\db-honorarium\migrations\20241216183121_get_riwayat_pengajuan_payment_status\migration.sql
```

```sql
UPDATE "_prisma_migrations"
SET "checksum" = lower('610F83112DBEFA49A1694A369268A7C1F2B4A1E5EF1B40A8554834BDB7F1D2F6')
WHERE "migration_name" = '20241216183121_get_riwayat_pengajuan_payment_status'

select * from "_prisma_migrations"
```
