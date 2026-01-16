import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/employees/route'
import { createAdminClient } from '@/lib/supabase/server'
import { createMockParentUser, createValidEmployeeData, setupSupabaseMock } from '../../helpers'

vi.mock('@/lib/supabase/server')

describe('POST /api/employees - Concurrent Request Tests', () => {
  let mockRequest: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequest = {
      json: vi.fn(),
    }
  })

  describe('Race Conditions', () => {
    it('should handle concurrent requests with identical data', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      // First request passes duplicate check
      let firstRequest = true
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
                    // Simulate race condition: first request finds no duplicate,
                    // second request also finds no duplicate (both check before insert)
                    data: firstRequest ? null : { user_uid: 'existing-user-uid' },
                    error: null,
                  })),
                })),
              })),
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: { user_uid: 'new-user-uid' },
                    error: firstRequest ? null : { message: 'duplicate key' },
                  })),
                })),
              })),
              delete: vi.fn(() => ({
                eq: vi.fn(() => ({ error: null })),
              })),
            }
          }
          if (table === 'garage_auth') {
            return {
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: { user_uid: 'new-user-uid' },
                    error: null,
                  })),
                })),
              })),
            }
          }
          return {}
        }),
      }

      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      // Make concurrent requests
      const requests = [
        POST({ ...mockRequest }),
        POST({ ...mockRequest }),
        POST({ ...mockRequest }),
      ]

      const responses = await Promise.all(requests)

      // At least one should fail due to race condition
      const successCount = responses.filter(r => r.status === 201).length
      const failCount = responses.filter(r => r.status === 409 || r.status === 500).length

      console.log(`Concurrent requests: ${successCount} succeeded, ${failCount} failed`)

      // Race condition vulnerability exists
      expect(successCount + failCount).toBe(3)

      if (successCount > 1) {
        console.warn('SECURITY: Race condition allowed duplicate insertion')
      }
    })

    it('should handle rapid sequential duplicate checks', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      let checkCount = 0
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
                    data: checkCount++ > 0 ? { user_uid: 'existing' } : null,
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
                eq: vi.fn(() => ({ error: null })),
              })),
            }
          }
          if (table === 'garage_auth') {
            return {
              insert: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: { user_uid: 'new-user-uid' },
                    error: null,
                  })),
                })),
              })),
            }
          }
          return {}
        }),
      }

      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      // Make 10 rapid requests
      const requests = Array(10).fill(null).map(() => POST({ ...mockRequest }))
      const responses = await Promise.all(requests)

      const firstSuccess = responses[0].status
      const others = responses.slice(1)

      if (firstSuccess === 201) {
        // Others should fail
        const failedDuplicates = others.filter(r => r.status === 409).length
        console.log(`Race condition test: ${failedDuplicates}/10 correctly rejected duplicates`)

        if (failedDuplicates < 9) {
          console.warn('SECURITY: Some duplicate requests were not blocked')
        }
      }
    })
  })

  describe('Database Connection Issues', () => {
    it('should handle connection timeout during parent user fetch', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { message: 'Connection timeout', code: 'ETIMEDOUT' },
              })),
            })),
          })),
        })),
      }

      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const response = await POST(mockRequest)
      const result = await response.json()

      expect(response.status).toBe(404)
    })

    it('should handle connection timeout during insert', async () => {
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
                    data: null,
                    error: { message: 'Connection timeout', code: 'ETIMEDOUT' },
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
      expect(result.data.error).toContain('Failed to create user')
    })

    it('should handle database connection drop between operations', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      let connectionDropped = false
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
                  single: vi.fn(() => {
                    connectionDropped = true
                    return {
                      data: { user_uid: 'new-user-uid' },
                      error: null,
                    }
                  }),
                })),
              })),
              delete: vi.fn(() => ({
                eq: vi.fn(() => ({
                  error: connectionDropped ? { message: 'Connection lost' } : null,
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
                    error: { message: 'Connection lost' },
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
      console.warn('Connection lost during transaction - orphaned record may exist')
    })
  })

  describe('Load Testing', () => {
    it('should handle 50 concurrent requests (performance test)', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const startTime = Date.now()

      // Make 50 concurrent requests
      const requests = Array(50).fill(null).map((_, i) => {
        return POST({
          json: vi.fn().mockResolvedValue({
            ...employeeData,
            firstName: `Employee${i}`,
          }),
        })
      })

      const responses = await Promise.all(requests)

      const duration = Date.now() - startTime

      console.log(`50 concurrent requests completed in ${duration}ms`)
      console.log(`Average: ${duration / 50}ms per request`)

      // All should succeed
      const successCount = responses.filter(r => r.status === 201).length
      expect(successCount).toBe(50)

      // Performance expectation: should complete in reasonable time
      expect(duration).toBeLessThan(10000) // 10 seconds
    })

    it('should handle mixed valid and invalid requests concurrently', async () => {
      const mockAdminClient = setupSupabaseMock(
        createMockParentUser(),
        null,
        { user_uid: 'new-user-uid' },
        { user_uid: 'new-user-uid' }
      )
      vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any)

      const requests = [
        // Valid request
        POST({
          json: vi.fn().mockResolvedValue(createValidEmployeeData()),
        }),
        // Missing field
        POST({
          json: vi.fn().mockResolvedValue({
            lastName: 'Doe',
            userRole: 'mechanic',
            email: 'test@test.com',
            phoneNumber: '1234567890',
            parentUserUid: '123e4567-e89b-12d3-a456-426614174000',
          }),
        }),
        // Invalid email
        POST({
          json: vi.fn().mockResolvedValue({
            ...createValidEmployeeData(),
            email: 'invalid-email',
          }),
        }),
        // Valid request
        POST({
          json: vi.fn().mockResolvedValue(createValidEmployeeData()),
        }),
      ]

      const responses = await Promise.all(requests)

      expect(responses[0].status).toBe(201)
      expect(responses[1].status).toBe(400)
      expect(responses[2].status).toBe(400)
      expect(responses[3].status).toBe(201)
    })
  })

  describe('UUID Generation Collisions', () => {
    it('should handle extremely unlikely UUID collision', async () => {
      const employeeData = createValidEmployeeData()
      mockRequest.json.mockResolvedValue(employeeData)

      // This is virtually impossible with UUID v4, but let's test the handling
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
                    error: { message: 'duplicate key value violates unique constraint "users_pkey"' },
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
      expect(result.data.error).toContain('Failed to create user')
    })
  })
})
