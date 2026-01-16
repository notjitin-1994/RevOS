-- Step 1: Create the change_user_password function (if it doesn't exist)
CREATE OR REPLACE FUNCTION change_user_password(
    p_user_uid UUID,
    p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
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

-- Step 2: Reset password to 'rohit@lad' for user 2579ae84-f385-4f0c-b53e-0e508b181604
SELECT change_user_password('2579ae84-f385-4f0c-b53e-0e508b181604', 'rohit@lad');

-- Step 3: Verify the update
SELECT
    user_uid,
    login_id,
    first_name,
    last_name,
    LEFT(password_hash, 30) as password_hash_preview
FROM garage_auth
WHERE user_uid = '2579ae84-f385-4f0c-b53e-0e508b181604';

-- Step 4: Test that the password works
SELECT * FROM verify_garage_login('rohit.lad@motorradtheory', 'rohit@lad');
