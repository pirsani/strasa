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

## UI

### install zustand for state management

```sh
pnpm add zustand
pnpm add lodash
pnpm add -D @types/lodash
```
