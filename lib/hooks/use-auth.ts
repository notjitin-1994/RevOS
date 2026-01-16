'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { LoginFormValues } from '@/lib/schemas/login'

export interface UserData {
  garageId: string
  userUid: string
  firstName: string
  lastName: string
  garageName: string
  userRole: string
  profileImageUrl?: string
  loginId: string
  hasPassword: boolean
}

/**
 * Authentication hook for login functionality
 *
 * Fetches user by login_id from the garage_auth table
 * without password verification
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()

  /**
   * Login function - looks up user by login ID only
   * @param credentials - Login ID
   * @returns Promise that resolves when lookup is complete
   */
  const login = useCallback(async (credentials: LoginFormValues): Promise<UserData> => {
    setIsLoading(true)
    setError(null)

    try {
      // Call the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: credentials.loginId,
        }),
      })

      const data = await response.json()

      // Handle errors
      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please try again.')
      }

      // Store user data in state
      const userData = data.user as UserData
      setUser(userData)

      // Store user data in sessionStorage for session management
      sessionStorage.setItem('user', JSON.stringify(userData))

      return userData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  /**
   * Verify password for the logged in user
   * @param password - Password to verify
   * @returns Promise that resolves when verification is complete
   */
  const verifyPassword = useCallback(async (password: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the loginId from the current user state
      if (!user) {
        throw new Error('User not found. Please login first.')
      }

      // Call the password verification API endpoint
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: user.loginId,
          password: password,
        }),
      })

      const data = await response.json()

      // Handle verification errors
      if (!response.ok) {
        throw new Error(data.error || 'Password verification failed.')
      }

      // Password verified successfully
      return
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password verification failed.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  /**
   * Set a new password for the user (used during first-time setup or password change)
   * @param newPassword - The new password to set
   * @returns Promise that resolves when password is set
   */
  const setPassword = useCallback(async (newPassword: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the loginId from the current user state
      if (!user) {
        throw new Error('User not found. Please login first.')
      }

      // Call the set password API endpoint
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: user.loginId,
          newPassword: newPassword,
        }),
      })

      const data = await response.json()

      // Handle errors
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password.')
      }

      // Update user state to reflect that password is now set
      setUser((prev) => prev ? { ...prev, hasPassword: true } : null)

      return
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set password.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  /**
   * Continue to the main app after successful login
   */
  const continueToApp = useCallback(() => {
    router.push('/settings')
  }, [router])

  return {
    login,
    user,
    isLoading,
    error,
    clearError: useCallback(() => setError(null), []),
    verifyPassword,
    setPassword,
    continueToApp,
  }
}
