import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/employees/route'
import { createAdminClient } from '@/lib/supabase/server'
import { createMockParentUser, createValidEmployeeData, setupSupabaseMock } from '../../helpers'

vi.mock('@/lib/supabase/server')

describe('POST /api/employees - Security Tests', () => {
  let mockRequest: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequest = {
      json: vi.fn(),
    }
  })

  describe('SQL Injection Attempts', () => {
    it('should handle SQL injection in firstName', async () => {
      const employeeData = createValidEmployeeData({
        firstName: "'; DROP TABLE users; --",
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

      // The SQL injection should be sanitized by Supabase, but it's stored in the database
      expect(response.status).toBe(201)
      expect(result.employee.firstName).toContain("DROP TABLE")
      expect(result.employee.loginId).toContain('drop.table')

      // SECURITY ISSUE: SQL injection payload is NOT sanitized
      console.warn('SECURITY: SQL injection payload stored in firstName:', result.employee.firstName)
    })

    it('should handle SQL injection in lastName', async () => {
      const employeeData = createValidEmployeeData({
        lastName: "1' OR '1'='1",
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
      expect(result.employee.lastName).toContain("OR")

      // SECURITY ISSUE: SQL injection payload stored
      console.warn('SECURITY: SQL injection payload stored in lastName')
    })

    it('should handle SQL injection in email', async () => {
      const employeeData = createValidEmployeeData({
        email: "test@test.com'; DROP TABLE users; --",
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      // Email validation should catch this
      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })

    it('should handle SQL injection in phoneNumber', async () => {
      const employeeData = createValidEmployeeData({
        phoneNumber: "'; DROP TABLE users; --",
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      // Phone validation should catch this
      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid phone number')
    })

    it('should handle SQL injection in parentUserUid', async () => {
      const employeeData = createValidEmployeeData({
        parentUserUid: "'; DROP TABLE users; --",
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(null)
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)

      // Invalid UUID should cause 404
      expect(response.status).toBe(404)
    })
  })

  describe('XSS (Cross-Site Scripting) Attempts', () => {
    it('should handle XSS in firstName (VULNERABILITY)', async () => {
      const employeeData = createValidEmployeeData({
        firstName: '<script>alert("XSS")</script>',
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

      // SECURITY ISSUE: XSS payload is NOT sanitized
      expect(response.status).toBe(201)
      expect(result.employee.firstName).toContain('<script>')
      expect(result.employee.loginId).toContain('<script>')

      console.warn('SECURITY: XSS payload stored in firstName without sanitization')
    })

    it('should handle XSS in lastName (VULNERABILITY)', async () => {
      const employeeData = createValidEmployeeData({
        lastName: '<img src=x onerror=alert("XSS")>',
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

      // SECURITY ISSUE: XSS payload stored
      expect(response.status).toBe(201)
      expect(result.employee.lastName).toContain('<img')

      console.warn('SECURITY: XSS payload stored in lastName')
    })

    it('should handle XSS in email (caught by validation)', async () => {
      const employeeData = createValidEmployeeData({
        email: '<script>alert("XSS")</script>@example.com',
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })

    it('should handle polyglot XSS payload (VULNERABILITY)', async () => {
      const xssPayload = 'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>'
      const employeeData = createValidEmployeeData({
        firstName: xssPayload,
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

      // SECURITY ISSUE: Complex XSS payload stored
      expect(response.status).toBe(201)

      console.warn('SECURITY: Polyglot XSS payload stored without sanitization')
    })
  })

  describe('Command Injection Attempts', () => {
    it('should handle command injection in firstName (VULNERABILITY)', async () => {
      const employeeData = createValidEmployeeData({
        firstName: '; cat /etc/passwd',
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

      // SECURITY ISSUE: Command injection payload stored
      expect(response.status).toBe(201)
      expect(result.employee.firstName).toContain('cat /etc/passwd')

      console.warn('SECURITY: Command injection payload stored')
    })

    it('should handle pipe command injection', async () => {
      const employeeData = createValidEmployeeData({
        firstName: '| rm -rf /',
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
      expect(result.employee.firstName).toContain('rm -rf')
    })
  })

  describe('Path Traversal Attempts', () => {
    it('should handle path traversal in firstName (VULNERABILITY)', async () => {
      const employeeData = createValidEmployeeData({
        firstName: '../../../etc/passwd',
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

      // SECURITY ISSUE: Path traversal payload stored
      expect(response.status).toBe(201)
      expect(result.employee.firstName).toContain('..')

      console.warn('SECURITY: Path traversal payload stored')
    })

    it('should handle URL-encoded path traversal', async () => {
      const employeeData = createValidEmployeeData({
        firstName: '%2e%2e%2fetc%2fpasswd',
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
      expect(result.employee.firstName).toContain('%2e')
    })
  })

  describe('Buffer Overflow Attempts', () => {
    it('should handle very long firstName (10,000 characters)', async () => {
      const longString = 'A'.repeat(10000)
      const employeeData = createValidEmployeeData({
        firstName: longString,
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

      // Should either reject or truncate
      expect([201, 400, 413]).toContain(response.status)

      if (response.status === 201) {
        console.warn('SECURITY: No length validation on firstName - database may be at risk')
        expect(result.employee.firstName.length).toBe(10000)
      }
    })

    it('should handle very long lastName (50,000 characters)', async () => {
      const longString = 'B'.repeat(50000)
      const employeeData = createValidEmployeeData({
        lastName: longString,
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

      expect([201, 400, 413]).toContain(response.status)

      if (response.status === 201) {
        console.warn('SECURITY: No length validation on lastName')
      }
    })

    it('should handle very long email (causes validation failure)', async () => {
      const longEmail = 'a'.repeat(300) + '@example.com'
      const employeeData = createValidEmployeeData({
        email: longEmail,
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email format')
    })
  })

  describe('NoSQL Injection Attempts', () => {
    it('should handle NoSQL injection in firstName', async () => {
      const employeeData = createValidEmployeeData({
        firstName: '{"$ne": null}',
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

      // NoSQL injection payload is stored
      expect(response.status).toBe(201)
      expect(result.employee.firstName).toContain('$ne')
    })
  })

  describe('LDAP Injection Attempts', () => {
    it('should handle LDAP injection in firstName', async () => {
      const employeeData = createValidEmployeeData({
        firstName: '*)(uid=*',
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
      expect(result.employee.firstName).toContain('uid=*')
    })
  })

  describe('Information Disclosure', () => {
    it('should leak database structure in error messages (VULNERABILITY)', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      // Mock a database error
      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        null, // Insert fails
        null
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.data).toHaveProperty('error')
      expect(result.data).toHaveProperty('details')

      // SECURITY ISSUE: Detailed error messages may leak database structure
      console.warn('SECURITY: Detailed error messages may leak sensitive information:', result.data.details)
    })
  })

  describe('Authentication and Authorization', () => {
    it('should allow requests without authentication (VULNERABILITY)', async () => {
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

      // SECURITY ISSUE: No authentication check - anyone can add employees
      expect(response.status).toBe(201)
      console.warn('SECURITY: No authentication required to add employees')
    })

    it('should allow adding employees to any garage (VULNERABILITY)', async () => {
      // Attacker knows a valid parentUserUid from another garage
      const employeeData = createValidEmployeeData({
        parentUserUid: '99999999-9999-9999-9999-999999999999', // Different garage
      })
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser({ user_uid: '99999999-9999-9999-9999-999999999999' }),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)

      // SECURITY ISSUE: No authorization check - can add employees to any garage
      expect(response.status).toBe(201)
      console.warn('SECURITY: No authorization check - can add employees to any garage')
    })
  })

  describe('Rate Limiting', () => {
    it('should allow rapid consecutive requests (VULNERABILITY)', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      // Make 100 rapid requests
      const requests = Array(100).fill(null).map(() => POST(mockRequest))
      const responses = await Promise.all(requests)

      // SECURITY ISSUE: No rate limiting - all requests succeed
      const successful = responses.filter(r => r.status === 201).length
      expect(successful).toBe(100)
      console.warn('SECURITY: No rate limiting - vulnerable to DoS attacks')
    })
  })
})
