import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

/**
 * Hash a password using bcrypt
 * This matches the format used by Postgres crypt() function
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
