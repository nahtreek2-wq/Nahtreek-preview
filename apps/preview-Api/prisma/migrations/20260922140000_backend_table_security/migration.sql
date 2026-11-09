-- Defense in depth: no direct browser-role access to backend-owned records.
-- The backend's database owner can still access tables through Prisma.
DO $$
DECLARE target record; api_role text;
BEGIN
  FOR target IN SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tableowner = current_user
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target.tablename);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', target.tablename);
    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', target.tablename, api_role);
      END IF;
    END LOOP;
  END LOOP;
END $$;
