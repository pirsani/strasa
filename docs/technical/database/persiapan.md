# Persiapan Database

```sql

CREATE DATABASE panda

CREATE ROLE pandamin WITH LOGIN PASSWORD 'passpandamin';

\c panda
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pandamin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pandamin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO pandamin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO pandamin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO pandamin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO pandamin;


CREATE ROLE nextusr WITH LOGIN PASSWORD 'passnextusr';
\c panda
-- Connect to the database
\c panda

-- Grant CONNECT privilege on the database
GRANT CONNECT ON DATABASE panda TO nextusr;

-- Grant USAGE on the schema
GRANT USAGE ON SCHEMA public TO nextusr;

-- Grant full privileges (SELECT, INSERT, UPDATE, DELETE) on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nextusr;

-- Set default privileges for tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nextusr;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nextusr;

-- Set default privileges for sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO nextusr;

-- Grant EXECUTE on all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO nextusr;

-- Set default privileges for functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO nextusr;


```

````
# Backup Database

To back up the `honorarium` database, use the following command. Ensure that the user running the command has access to the backup directory.

## Option 1: Change Permissions of `/home/submin`

```sh
sudo chmod +x /home/submin
sudo -u postgres pg_dump -U postgres -F c -b -v -f /home/submin/BACKUPDB/honorarium.backup honorarium
````

## Option 2: Change the Backup Directory

Create a new directory that the `postgres` user can access:

```sh
sudo mkdir -p /var/lib/postgresql/backups
sudo chown postgres:postgres /var/lib/postgresql/backups
```

Run the `pg_dump` command:

```sh
sudo -u postgres pg_dump -U postgres -F c -b -v -f /var/lib/postgresql/backups/honorarium.backup honorarium
scp remotemachine:/var/lib/postgresql/backups/honorarium.backup ./honorarium.backup

```
