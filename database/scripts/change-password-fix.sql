-- OPTION 1: Direct SQL to immediately change the password for user 4e064e84-7d8c-4ff7-affa-9eec8585ddd3
-- Run this first to reset the password to "rohit@lad"
UPDATE garage_auth
SET password_hash = crypt('rohit@lad', gen_salt('bf')),
    updated_at = NOW()
WHERE user_uid = '4e064e84-7d8c-4ff7-affa-9eec8585ddd3';

-- Verify the update
SELECT user_uid, LEFT(password_hash, 20) as password_hash_preview
FROM garage_auth
WHERE user_uid = '4e064e84-7d8c-4ff7-affa-9eec8585ddd3';


-- OPTION 2: Create a reusable function to change any user's password
CREATE OR REPLACE FUNCTION change_user_password(
    p_user_uid UUID,
    p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
BEGIN
    UPDATE garage_auth
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE user_uid = p_user_uid;

    RETURN FOUND;
END;
$$;

-- Usage: Call this function to change a password
-- SELECT change_user_password('4e064e84-7d8c-4ff7-affa-9eec8585ddd3', 'rohit@lad');
