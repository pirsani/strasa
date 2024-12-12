-- Copy table privileges
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'GRANT ALL PRIVILEGES ON TABLE ' || r.tablename || ' TO remoteusr';
    END LOOP;
END $$;

-- Copy sequence privileges
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE 'GRANT ALL PRIVILEGES ON SEQUENCE ' || r.sequencename || ' TO remoteusr';
    END LOOP;
END $$;

-- Copy function privileges
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public') LOOP
        EXECUTE 'GRANT ALL PRIVILEGES ON FUNCTION ' || r.routine_name || ' TO remoteusr';
    END LOOP;
END $$;

-- Copy view privileges
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        EXECUTE 'GRANT SELECT ON ' || quote_ident(r.viewname) || ' TO remoteusr';
    END LOOP;
END $$;