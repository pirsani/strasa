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
