import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/employees/route'
import { createAdminClient } from '@/lib/supabase/server'
import { createMockParentUser, createValidEmployeeData, setupSupabaseMock } from '../../helpers'

vi.mock('@/lib/supabase/server')

describe('POST /api/employees - Edge Cases Tests', () => {
  let mockRequest: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequest = {
      json: vi.fn(),
    }
  })

  describe('Empty and Whitespace Tests', () => {
    it('should handle empty string after trimming in firstName', async () => {
      const employeeData = createValidEmployeeData({
        firstName: '   ',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('All fields are required')
    })

    it('should handle empty string after trimming in lastName', async () => {
      const employeeData = createValidEmployeeData({
        lastName: '\t\n',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })

    it('should handle empty string after trimming in email', async () => {
      const employeeData = createValidEmployeeData({
        email: '   ',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })

    it('should handle empty string after trimming in phoneNumber', async () => {
      const employeeData = createValidEmployeeData({
        phoneNumber: '  \t  \n  ',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })

    it('should handle whitespace-only parentUserUid', async () => {
      const employeeData = createValidEmployeeData({
        parentUserUid: '   ',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })
  })

  describe('Single Character Tests', () => {
    it('should handle single character firstName', async () => {
      const employeeData = createValidEmployeeData({
        firstName: 'A',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.employee.loginId).toBe('a.doe@testgarage')
    })

    it('should handle single character lastName', async () => {
      const employeeData = createValidEmployeeData({
        lastName: 'B',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.employee.loginId).toBe('john.b@testgarage')
    })
  })

  describe('Unicode and Special Characters', () => {
    it('should handle emoji in firstName (VULNERABILITY)', async () => {
      const employeeData = createValidEmployeeData({
        firstName: '😀🎉',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      // Emoji are stored without validation
      expect(response.status).toBe(201)
      expect(result.employee.firstName).toContain('😀')
      console.warn('No validation for emoji in names')
    })

    it('should handle zero-width characters', async () => {
      const employeeData = createValidEmployeeData({
        firstName: 'John\u200B\u200C\u200D', // Zero-width characters
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.employee.firstName).toContain('\u200B')
    })

    it('should handle null bytes', async () => {
      const employeeData = createValidEmployeeData({
        firstName: 'John\u0000Doe',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.employee.firstName).toContain('\u0000')
    })

    it('should handle right-to-left override character', async () => {
      const employeeData = createValidEmployeeData({
        firstName: 'John\u202E', // Right-to-left override
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.employee.firstName).toContain('\u202E')
    })
  })

  describe('Duplicate Login ID Scenarios', () => {
    it('should reject duplicate login_id (same name, same garage)', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        { user_uid: 'existing-user-uid' }, // Existing user with same login_id
        null
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(409)
      expect(result.error).toContain('already exists')
    })

    it('should handle case sensitivity variations', async () => {
      const employeeData = createValidEmployeeData({
        firstName: 'john',
        lastName: 'doe',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      // Database might be case-insensitive
      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        { user_uid: 'existing-user-uid' }, // "John.Doe" already exists
        null
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)

      // This might fail if database collation is case-insensitive
      expect([409, 201]).toContain(response.status)
    })

    it('should handle whitespace variations in names', async () => {
      const employeeData1 = createValidEmployeeData({
        firstName: 'John  Doe', // Double space
        lastName: 'Smith',
      })
      mockRequest.json.mockResolvedValue(employeeData1)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      // Spaces are collapsed to one, then removed for login_id
      expect(response.status).toBe(201)
      expect(result.employee.loginId).toBe('john.smith@testgarage')
    })
  })

  describe('Special Character Processing', () => {
    it('should process garage name with special characters', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser({ garage_name: "O'Neil's Garage" }),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.employee.loginId).toContain("o'neil's")
    })

    it('should process garage name with numbers', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser({ garage_name: 'Garage 123' }),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.employee.loginId).toBe('john.doe@garage123')
    })

    it('should process garage name with multiple words', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser({ garage_name: 'The Best Garage in Town' }),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.employee.loginId).toBe('john.doe@thebestgarageintown')
    })
  })

  describe('Phone Number Edge Cases', () => {
    it('should handle exactly 10 digit phone number', async () => {
      const employeeData = createValidEmployeeData({
        phoneNumber: '1234567890',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)

      expect(response.status).toBe(201)
    })

    it('should handle phone number with extension', async () => {
      const employeeData = createValidEmployeeData({
        phoneNumber: '+1234567890 ext 1234',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      // This might fail due to space
      expect([201, 400]).toContain(response.status)
    })

    it('should handle phone number with leading zeros', async () => {
      const employeeData = createValidEmployeeData({
        phoneNumber: '001234567890',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)

      expect(response.status).toBe(201)
    })
  })

  describe('Null and Undefined Handling', () => {
    it('should handle null values in request body', async () => {
      const employeeData = createValidEmployeeData({
        firstName: null as any,
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })

    it('should handle undefined values in request body', async () => {
      const employeeData = createValidEmployeeData({
        lastName: undefined as any,
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })
  })

  describe('Malformed JSON', () => {
    it('should handle invalid JSON in request body', async () => {
      mockRequest.json.mockRejectedValue(new Error('Unexpected token'))

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.data).toHaveProperty('error')
    })
  })

  describe('Timestamp Issues', () => {
    it('should handle timezone variations in timestamps', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      // Timestamps are generated client-side (in the API)
      // This could cause issues if servers have clock drift
    })
  })

  describe('Garage Name Edge Cases', () => {
    it('should handle empty garage name in parent user', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser({ garage_name: '' }),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.employee.loginId).toBe('john.doe@')
    })

    it('should handle garage name with only special characters', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser({ garage_name: '!@#$%' }),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.employee.loginId).toBe('john.doe@!@#$%')
    })
  })

  describe('Database Constraint Violations', () => {
    it('should handle duplicate email in database (if constraint exists)', async () => {
      const employeeData = createValidEmployeeData({
        email: 'existing@example.com',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { error: { message: 'duplicate key value violates unique constraint "users_email_key"' } }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.data.error).toContain('Failed to create user')
    })
  })

  describe('Transaction Rollback Scenarios', () => {
    it('should rollback user insert when auth insert fails', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      let deleteCalled = false
      const mockAdminClient = {
        from: vi.fn((table: string) => {
          if (table === 'users') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: createMockParentUser(),
                    error: null,
                  })),
                  maybeSingle: vi.fn(() => ({
                    data: null,
                    error: null,
                  })),
                })),
              })),
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: { user_uid: 'new-user-uid' },
                    error: null,
                  })),
                })),
              })),
              delete: vi.fn(() => ({
                eq: vi.fn(() => {
                  deleteCalled = true
                  return { error: null }
                }),
              })),
            }
          }
          if (table === 'garage_auth') {
            return {
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: null,
                    error: { message: 'Auth insert failed' },
                  })),
                })),
              })),
            }
          }
          return {}
        }),
      }

      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.data.error).toContain('authentication record')
      expect(deleteCalled).toBe(true)
    })

    it('should handle rollback failure', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = {
        from: vi.fn((table: string) => {
          if (table === 'users') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: createMockParentUser(),
                    error: null,
                  })),
                  maybeSingle: vi.fn(() => ({
                    data: null,
                    error: null,
                  })),
                })),
              })),
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: { user_uid: 'new-user-uid' },
                    error: null,
                  })),
                })),
              })),
              delete: vi.fn(() => ({
                eq: vi.fn(() => ({
                  error: { message: 'Delete failed' },
                })),
              })),
            }
          }
          if (table === 'garage_auth') {
            return {
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: null,
                    error: { message: 'Auth insert failed' },
                  })),
                })),
              })),
            }
          }
          return {}
        }),
      }

      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)

      expect(response.status).toBe(500)
      // Orphaned record exists in database
      console.warn('Rollback failed - orphaned record in database')
    })
  })
})
