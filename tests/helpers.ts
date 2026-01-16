import { createAdminClient } from '@/lib/supabase/server'

/**
 * Test helper to create a mock parent user response
 */
export function createMockParentUser(overrides = {}) {
  return {
    user_uid: '123e4567-e89b-12d3-a456-426614174000',
    garage_uid: 'garage-uid-123',
    garage_id: 'GARAGE001',
    garage_name: 'Test Garage',
    first_name: 'Admin',
    last_name: 'User',
    login_id: 'admin.user@testgarage',
    user_role: 'admin',
    email: 'admin@test.com',
    phone_number: '+1234567890',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Test helper to create valid employee data
 */
export function createValidEmployeeData(overrides = {}) {
  return {
    firstName: 'John',
    lastName: 'Doe',
    userRole: 'mechanic',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    parentUserUid: '123e4567-e89b-12d3-a456-426614174000',
    ...overrides,
  }
}

/**
 * Test helper to mock Supabase response
 */
export function createMockResponse(data: any, error: any = null) {
  return {
    data,
    error,
    select: vi.fn(() => ({ data, error, single: vi.fn(() => ({ data, error })) })),
    single: vi.fn(() => ({ data, error })),
    maybeSingle: vi.fn(() => ({ data, error })),
    insert: vi.fn(() => ({ data, error, select: vi.fn(() => ({ data, error, single: vi.fn(() => ({ data, error })) })) })),
    update: vi.fn(() => ({ data, error })),
    delete: vi.fn(() => ({ data, error })),
    eq: vi.fn(() => ({ data, error, select: vi.fn(() => ({ data, error, single: vi.fn(() => ({ data, error })) })) })),
  }
}

/**
 * Test helper to setup mocked Supabase chain
 */
export function setupSupabaseMock(
  mockParentUser: any = null,
  mockExistingUser: any = null,
  mockInsertUser: any = null,
  mockInsertAuth: any = null
) {
  const adminClient = {
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: mockParentUser,
                error: mockParentUser ? null : { message: 'User not found' },
              })),
              maybeSingle: vi.fn(() => ({
                data: mockExistingUser,
                error: null,
              })),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: mockInsertUser,
                error: mockInsertUser ? null : { message: 'Insert failed' },
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
                data: mockInsertAuth,
                error: mockInsertAuth ? null : { message: 'Insert failed' },
              })),
            })),
          })),
        }
      }
      return {}
    }),
  }

  return adminClient
}

/**
 * Helper to make API request
 */
export async function makeEmployeeRequest(body: any) {
  const baseUrl = 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()
  return { status: response.status, data }
}

/**
 * Common assertions for error responses
 */
export function assertErrorResponse(
  result: { status: number; data: any },
  expectedStatus: number,
  expectedErrorMessage: string
) {
  expect(result.status).toBe(expectedStatus)
  expect(result.data).toHaveProperty('error')
  expect(result.data.error).toContain(expectedErrorMessage)
}

/**
 * Helper to generate test UUID
 */
export function generateTestUUID() {
  return '00000000-0000-4000-8000-000000000000'
}
