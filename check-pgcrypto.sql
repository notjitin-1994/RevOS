-- Check if pgcrypto extension exists
SELECT extname, extversion FROM pg_extension WHERE extname = 'pgcrypto';

-- If the above returns no rows, enable pgcrypto with this:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Test if crypt and gen_salt work
-- SELECT crypt('test', gen_salt('bf'));
