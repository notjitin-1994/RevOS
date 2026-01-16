'use client'

import { useState, useCallback } from 'react'
import type { LoginFormValues } from '@/lib/schemas/login'

/**
 * Authentication hook for login functionality
 *
 * This is a stub implementation that can be connected to a real authentication service later.
 * For now, it simulates an async login process.
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Login function
   * @param credentials - Login ID and password
   * @returns Promise that resolves when login is complete
   */
  const login = useCallback(async (credentials: LoginFormValues): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      // In production, this would call your authentication API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // TODO: Replace with actual authentication logic
      console.log('Login attempted with:', {
        loginId: credentials.loginId,
        timestamp: new Date().toISOString(),
      })

      // Simulate successful login
      // In production, you would:
      // 1. Send credentials to your API
      // 2. Receive a JWT/token
      // 3. Store the token (e.g., in cookies or secure storage)
      // 4. Redirect to dashboard
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    login,
    isLoading,
    error,
    clearError: useCallback(() => setError(null), []),
  }
}
