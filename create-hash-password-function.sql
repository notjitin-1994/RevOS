-- Function to hash a password using PostgreSQL crypt() with bcrypt
-- This creates a hash compatible with the verify_garage_login function
CREATE OR REPLACE FUNCTION hash_password_new(p_password TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(p_password, gen_salt('bf'));
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION hash_password_new(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password_new(TEXT) TO service_role;
