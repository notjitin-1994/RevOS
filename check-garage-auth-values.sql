-- Check actual values in both tables for the specific user
SELECT
  'users' as table_name,
  user_uid,
  first_name,
  last_name,
  login_id,
  length(first_name) as first_name_length,
  length(last_name) as last_name_length,
  length(login_id) as login_id_length
FROM users
WHERE user_uid = '2579ae84-f385-4f0c-b53e-0e508b181604'

UNION ALL

SELECT
  'garage_auth' as table_name,
  user_uid,
  first_name,
  last_name,
  login_id,
  length(first_name) as first_name_length,
  length(last_name) as last_name_length,
  length(login_id) as login_id_length
FROM garage_auth
WHERE user_uid = '2579ae84-f385-4f0c-b53e-0e508b181604';

-- Also check column types for both tables
SELECT
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  ordinal_position
FROM information_schema.columns
WHERE table_name IN ('users', 'garage_auth')
  AND column_name IN ('first_name', 'last_name', 'login_id')
  AND table_schema = 'public'
ORDER BY
  table_name,
  ordinal_position;
