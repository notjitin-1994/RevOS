-- Function to verify a password against a stored bcrypt hash
-- Uses PostgreSQL's crypt() function to verify the password
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, stored_hash TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
IMMUTABLE
SECURITY DEFINER
RETURN crypt(input_password, stored_hash) = stored_hash;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO service_role;
