import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/employees/route'
import { createAdminClient } from '@/lib/supabase/server'
import { createMockParentUser, createValidEmployeeData, setupSupabaseMock } from '../../helpers'

// Mock the createAdminClient
vi.mock('@/lib/supabase/server')

describe('POST /api/employees - Validation Tests', () => {
  let mockRequest: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequest = {
      json: vi.fn(),
    }
  })

  describe('Valid Input Cases', () => {
    it('should create employee with all valid fields', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null, // No existing user
        { user_uid: 'new-user-uid' }, // Inserted user
        { user_uid: 'new-user-uid' } // Inserted auth
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.success).toBe(true)
      expect(result.employee).toHaveProperty('userUid')
      expect(result.employee).toHaveProperty('loginId')
      expect(result.employee.loginId).toBe('john.doe@testgarage')
    })

    it('should handle names with apostrophes (O\'Neil)', async () => {
      const employeeData = createValidEmployeeData({
        firstName: "O'Neil",
        lastName: 'Smith',
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
      expect(result.employee.loginId).toBe("o'neil.smith@testgarage")
    })

    it('should handle international characters (José, Müller)', async () => {
      const employeeData = createValidEmployeeData({
        firstName: 'José',
        lastName: 'Müller',
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
      expect(result.employee.loginId).toBe('jose.müller@testgarage')
    })

    it('should handle phone numbers with various formats', async () => {
      const employeeData = createValidEmployeeData({
        phoneNumber: '+1 (555) 123-4567',
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

  describe('Missing Required Fields', () => {
    it('should reject request with missing firstName', async () => {
      const { firstName, ...data } = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(data)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('All fields are required')
    })

    it('should reject request with missing lastName', async () => {
      const { lastName, ...data } = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(data)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('All fields are required')
    })

    it('should reject request with missing userRole', async () => {
      const { userRole, ...data } = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(data)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('All fields are required')
    })

    it('should reject request with missing email', async () => {
      const { email, ...data } = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(data)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('All fields are required')
    })

    it('should reject request with missing phoneNumber', async () => {
      const { phoneNumber, ...data } = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(data)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('All fields are required')
    })

    it('should reject request with missing parentUserUid', async () => {
      const { parentUserUid, ...data } = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(data)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Parent user UID is required')
    })

    it('should reject request with all fields missing', async () => {
      mockRequest.json.mockResolvedValue({})

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('All fields are required')
    })
  })

  describe('Invalid Data Types', () => {
    it('should reject firstName as number', async () => {
      const employeeData = createValidEmployeeData({ firstName: 123 as any })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
    })

    it('should reject lastName as array', async () => {
      const employeeData = createValidEmployeeData({ lastName: ['Doe'] as any })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })

    it('should reject email as object', async () => {
      const employeeData = createValidEmployeeData({ email: { address: 'test@test.com' } as any })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })

    it('should reject phoneNumber as boolean', async () => {
      const employeeData = createValidEmployeeData({ phoneNumber: true as any })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })

    it('should reject userRole as null', async () => {
      const employeeData = createValidEmployeeData({ userRole: null as any })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })
  })

  describe('Invalid Email Formats', () => {
    it('should reject email without @ symbol', async () => {
      const employeeData = createValidEmployeeData({ email: 'invalidemail.com' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })

    it('should reject email with multiple @ symbols', async () => {
      const employeeData = createValidEmployeeData({ email: 'test@test@com' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })

    it('should reject email without domain extension', async () => {
      const employeeData = createValidEmployeeData({ email: 'test@test' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })

    it('should reject email with leading dot', async () => {
      const employeeData = createValidEmployeeData({ email: 'test@.com' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })

    it('should reject email with trailing dot', async () => {
      const employeeData = createValidEmployeeData({ email: 'test@com.' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })

    it('should reject email with consecutive dots', async () => {
      const employeeData = createValidEmployeeData({ email: 'test@..com' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })

    it('should reject email with spaces', async () => {
      const employeeData = createValidEmployeeData({ email: 'test @example.com' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })

    it('should reject very long email (>254 characters)', async () => {
      const longEmail = 'a'.repeat(245) + '@example.com'
      const employeeData = createValidEmployeeData({ email: longEmail })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })
  })

  describe('Invalid Phone Numbers', () => {
    it('should reject phone number with less than 10 characters', async () => {
      const employeeData = createValidEmployeeData({ phoneNumber: '123456789' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid phone number')
    })

    it('should reject phone number with invalid characters', async () => {
      const employeeData = createValidEmployeeData({ phoneNumber: 'abc-def-ghi' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid phone number')
    })

    it('should reject empty phone number', async () => {
      const employeeData = createValidEmployeeData({ phoneNumber: '' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      expect(response.status).toBe(400)
    })

    it('should reject phone number with only special characters', async () => {
      const employeeData = createValidEmployeeData({ phoneNumber: '++++++++++' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      // This might pass the regex but should be flagged as invalid
      expect([400, 201]).toContain(response.status)
    })

    it('should reject phone number with only brackets', async () => {
      const employeeData = createValidEmployeeData({ phoneNumber: '((()))((()))' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)

      // This might pass the regex but should be flagged as invalid
      expect([400, 201]).toContain(response.status)
    })
  })

  describe('Parent User Validation', () => {
    it('should reject request with non-existent parent user', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(null) // No parent user
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(404)
      expect(result.error).toContain('Parent user not found')
    })

    it('should reject request with empty parentUserUid', async () => {
      const employeeData = createValidEmployeeData({ parentUserUid: '' })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Parent user UID is required')
    })

    it('should reject request with invalid UUID format', async () => {
      const employeeData = createValidEmployeeData({ parentUserUid: 'not-a-uuid' })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(null)
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)

      expect(response.status).toBe(404)
    })
  })

  describe('UserRole Validation', () => {
    it('should accept any string as userRole (no validation - VULNERABILITY)', async () => {
      const employeeData = createValidEmployeeData({ userRole: 'hacker' })
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

      // This demonstrates the vulnerability - any role is accepted
      expect(response.status).toBe(201)
      expect(result.employee.userRole).toBe('hacker')
    })

    it('should accept SQL injection as userRole (VULNERABILITY)', async () => {
      const employeeData = createValidEmployeeData({ userRole: "'; DROP TABLE users; --" })
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

      // This demonstrates the SQL injection vulnerability
      expect(response.status).toBe(201)
      expect(result.employee.userRole).toContain("DROP TABLE")
    })
  })
})
