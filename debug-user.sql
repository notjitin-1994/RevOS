-- Check the user record
SELECT
    user_uid,
    login_id,
    first_name,
    last_name,
    LEFT(password_hash, 30) as password_hash_preview,
    LENGTH(password_hash) as hash_length
FROM garage_auth
WHERE user_uid = '4e064e84-7d8c-4ff7-affa-9eec8585ddd3';

-- Test if the password works with crypt
SELECT
    user_uid,
    login_id,
    CASE WHEN password_hash = crypt('rohit@lad', password_hash)
        THEN 'PASSWORD MATCHES'
        ELSE 'PASSWORD DOES NOT MATCH'
    END as verification_result
FROM garage_auth
WHERE user_uid = '4e064e84-7d8c-4ff7-affa-9eec8585ddd3';

-- Test the verify_garage_login function
SELECT * FROM verify_garage_login('rohit.lad@motorradtheory', 'rohit@lad');
