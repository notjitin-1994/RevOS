-- Cleanup test employees created during failed attempts
-- These have user_uid but no complete auth record

-- First, let's see what test records exist
SELECT 
    u.user_uid,
    u.login_id,
    u.first_name,
    u.last_name,
    u.email,
    u.created_at,
    CASE WHEN ga.user_uid IS NOT NULL THEN 'Has Auth' ELSE 'No Auth' END as auth_status
FROM users u
LEFT JOIN garage_auth ga ON u.user_uid = ga.user_uid
WHERE u.login_id LIKE '%mohammad.zabi%'
ORDER BY u.created_at DESC;

-- Delete auth records for test employees
DELETE FROM garage_auth 
WHERE login_id = 'mohammad.zabi@motorradtheory';

-- Delete user records for test employees
DELETE FROM users 
WHERE login_id = 'mohammad.zabi@motorradtheory';

-- Verify cleanup
SELECT COUNT(*) as remaining_test_records
FROM users 
WHERE login_id LIKE '%mohammad.zabi%';
