import { createClient } from './client'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface DbUser {
  id: string
  garage_uid: string
  user_uid: string
  first_name: string
  last_name: string
  garage_name: string
  user_role: string
  login_id: string
  email: string | null
  alternate_email: string | null
  phone_number: string | null
  alternate_phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  date_of_birth: string | null
  blood_group: string | null
  employee_id: string | null
  department: string | null
  date_of_joining: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relation: string | null
  id_proof_type: string | null
  id_proof_number: string | null
  profile_picture: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserData {
  id?: string
  garageUid: string
  garageId?: string | null
  userUid: string
  firstName: string
  lastName: string
  garageName: string
  userRole: string
  loginId: string
  email?: string | null
  alternateEmail?: string | null
  phoneNumber?: string | null
  alternatePhone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  dateOfBirth?: string | null
  bloodGroup?: string | null
  employeeId?: string | null
  department?: string | null
  dateOfJoining?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  idProofType?: string | null
  idProofNumber?: string | null
  profilePicture?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  isActive?: boolean
}

/**
 * Transform database user data (snake_case) to frontend format (camelCase)
 */
function transformUserData(dbUser: DbUser): UserData {
  return {
    id: dbUser.id,
    garageUid: dbUser.garage_uid,
    userUid: dbUser.user_uid,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    garageName: dbUser.garage_name,
    userRole: dbUser.user_role,
    loginId: dbUser.login_id,
    email: dbUser.email,
    alternateEmail: dbUser.alternate_email,
    phoneNumber: dbUser.phone_number,
    alternatePhone: dbUser.alternate_phone,
    address: dbUser.address,
    city: dbUser.city,
    state: dbUser.state,
    zipCode: dbUser.zip_code,
    country: dbUser.country,
    dateOfBirth: dbUser.date_of_birth,
    bloodGroup: dbUser.blood_group,
    employeeId: dbUser.employee_id,
    department: dbUser.department,
    dateOfJoining: dbUser.date_of_joining,
    emergencyContactName: dbUser.emergency_contact_name,
    emergencyContactPhone: dbUser.emergency_contact_phone,
    emergencyContactRelation: dbUser.emergency_contact_relation,
    idProofType: dbUser.id_proof_type,
    idProofNumber: dbUser.id_proof_number,
    profilePicture: dbUser.profile_picture,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    isActive: dbUser.is_active,
  }
}

/**
 * Fetch user data by user_uid
 * @param userUid - User UID to fetch
 * @param client - Optional Supabase client. If not provided, creates browser client
 */
export async function getUserByUserUid(
  userUid: string,
  client?: SupabaseClient
): Promise<UserData | null> {
  const supabase = client || createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_uid', userUid)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  if (!data) {
    return null
  }

  return transformUserData(data)
}

/**
 * Fetch user data by garage_uid
 */
export async function getUserByGarageUid(garageUid: string): Promise<UserData | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('garage_uid', garageUid)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  if (!data) {
    return null
  }

  return transformUserData(data)
}

/**
 * Fetch user data by login_id
 */
export async function getUserByLoginId(loginId: string): Promise<UserData | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('login_id', loginId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  if (!data) {
    return null
  }

  return transformUserData(data)
}

/**
 * Update user data
 */
export async function updateUser(
  userUid: string,
  updates: Partial<Omit<UserData, 'garageUid' | 'userUid' | 'loginId' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> {
  const supabase = createClient()

  // Transform camelCase to snake_case for database
  const dbUpdates: Record<string, any> = {}
  if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName
  if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName
  if (updates.garageName !== undefined) dbUpdates.garage_name = updates.garageName
  if (updates.userRole !== undefined) dbUpdates.user_role = updates.userRole
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.alternateEmail !== undefined) dbUpdates.alternate_email = updates.alternateEmail
  if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber
  if (updates.alternatePhone !== undefined) dbUpdates.alternate_phone = updates.alternatePhone
  if (updates.address !== undefined) dbUpdates.address = updates.address
  if (updates.city !== undefined) dbUpdates.city = updates.city
  if (updates.state !== undefined) dbUpdates.state = updates.state
  if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode
  if (updates.country !== undefined) dbUpdates.country = updates.country
  if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth
  if (updates.bloodGroup !== undefined) dbUpdates.blood_group = updates.bloodGroup
  if (updates.employeeId !== undefined) dbUpdates.employee_id = updates.employeeId
  if (updates.department !== undefined) dbUpdates.department = updates.department
  if (updates.dateOfJoining !== undefined) dbUpdates.date_of_joining = updates.dateOfJoining
  if (updates.emergencyContactName !== undefined) dbUpdates.emergency_contact_name = updates.emergencyContactName
  if (updates.emergencyContactPhone !== undefined) dbUpdates.emergency_contact_phone = updates.emergencyContactPhone
  if (updates.emergencyContactRelation !== undefined) dbUpdates.emergency_contact_relation = updates.emergencyContactRelation
  if (updates.idProofType !== undefined) dbUpdates.id_proof_type = updates.idProofType
  if (updates.idProofNumber !== undefined) dbUpdates.id_proof_number = updates.idProofNumber
  if (updates.profilePicture !== undefined) dbUpdates.profile_picture = updates.profilePicture
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

  // Automatically update updated_at timestamp
  dbUpdates.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('user_uid', userUid)

  if (error) {
    console.error('Error updating user:', error)
    return false
  }

  return true
}

/**
 * Fetch garage settings by garage_uid
 * Note: Since garage settings are part of the users table, we fetch them from there
 */
export async function getGarageSettings(garageUid: string): Promise<UserData | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('garage_uid', garageUid)
    .single()

  if (error) {
    console.error('Error fetching garage settings:', error)
    return null
  }

  if (!data) {
    return null
  }

  return transformUserData(data)
}

/**
 * Generate login_id from first name, last name, and garage ID
 * Format: firstName.lastName@garageId (lowercase, no spaces)
 */
function generateLoginId(firstName: string, lastName: string, garageId: string): string {
  // Remove spaces, convert to lowercase
  const cleanFirst = firstName.trim().toLowerCase().replace(/\s+/g, '')
  const cleanLast = lastName.trim().toLowerCase().replace(/\s+/g, '')
  const cleanGarageId = garageId.trim().toLowerCase().replace(/\s+/g, '')

  return `${cleanFirst}.${cleanLast}@${cleanGarageId}`
}

/**
 * Update user data in both users and garage_auth tables
 * When first name or last name changes, also updates login_id in both tables
 *
 * @param supabaseClient - Supabase client (can be browser or server client)
 * @param userUid - User UID to update
 * @param updates - Fields to update
 */
export async function updateUserAcrossTables(
  supabaseClient: SupabaseClient,
  userUid: string,
  updates: Partial<Omit<UserData, 'garageUid' | 'userUid' | 'loginId' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: boolean; newLoginId?: string; error?: string }> {
  try {
    console.log('[updateUserAcrossTables] Starting update for user_uid:', userUid)
    console.log('[updateUserAcrossTables] Updates received:', updates)

    // Fetch current user data to get existing values
    const { data: currentUser, error: fetchError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('user_uid', userUid)
      .single()

    if (fetchError || !currentUser) {
      console.error('[updateUserAcrossTables] Error fetching current user:', fetchError)
      return { success: false, error: 'User not found' }
    }

    console.log('[updateUserAcrossTables] Current user data:', {
      userUid: currentUser.user_uid,
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      login_id: currentUser.login_id,
      garage_id: currentUser.garage_id,
    })

    // Check if we need to update login_id (when first name or last name changes)
    const nameChanged = updates.firstName || updates.lastName
    let newLoginId: string | undefined

    if (nameChanged) {
      const currentFirstName = updates.firstName || currentUser.first_name
      const currentLastName = updates.lastName || currentUser.last_name
      const currentGarageId = currentUser.garage_id || ''
      newLoginId = generateLoginId(currentFirstName, currentLastName, currentGarageId)

      console.log('[updateUserAcrossTables] Name changed, generating new login_id:', newLoginId)

      // Add login_id to updates (using type assertion since we're dynamically adding it)
      ;(updates as any).loginId = newLoginId
    }

    // Transform camelCase to snake_case for database
    const dbUpdates: Record<string, any> = {}
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName
    if (updates.garageName !== undefined) dbUpdates.garage_name = updates.garageName
    if (updates.garageId !== undefined) dbUpdates.garage_id = updates.garageId
    if (updates.userRole !== undefined) dbUpdates.user_role = updates.userRole
    // loginId is added dynamically when name changes
    if ((updates as any).loginId !== undefined) dbUpdates.login_id = (updates as any).loginId
    if (updates.email !== undefined) dbUpdates.email = updates.email
    if (updates.alternateEmail !== undefined) dbUpdates.alternate_email = updates.alternateEmail
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber
    if (updates.alternatePhone !== undefined) dbUpdates.alternate_phone = updates.alternatePhone
    if (updates.address !== undefined) dbUpdates.address = updates.address
    if (updates.city !== undefined) dbUpdates.city = updates.city
    if (updates.state !== undefined) dbUpdates.state = updates.state
    if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode
    if (updates.country !== undefined) dbUpdates.country = updates.country
    if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth
    if (updates.bloodGroup !== undefined) dbUpdates.blood_group = updates.bloodGroup
    if (updates.employeeId !== undefined) dbUpdates.employee_id = updates.employeeId
    if (updates.department !== undefined) dbUpdates.department = updates.department
    if (updates.dateOfJoining !== undefined) dbUpdates.date_of_joining = updates.dateOfJoining
    if (updates.emergencyContactName !== undefined) dbUpdates.emergency_contact_name = updates.emergencyContactName
    if (updates.emergencyContactPhone !== undefined) dbUpdates.emergency_contact_phone = updates.emergencyContactPhone
    if (updates.emergencyContactRelation !== undefined) dbUpdates.emergency_contact_relation = updates.emergencyContactRelation
    if (updates.idProofType !== undefined) dbUpdates.id_proof_type = updates.idProofType
    if (updates.idProofNumber !== undefined) dbUpdates.id_proof_number = updates.idProofNumber
    if (updates.profilePicture !== undefined) dbUpdates.profile_picture = updates.profilePicture
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

    // Automatically update updated_at timestamp
    dbUpdates.updated_at = new Date().toISOString()

    console.log('[updateUserAcrossTables] Transformed updates for DB:', {
      userUid,
      dbUpdates: {
        first_name: dbUpdates.first_name,
        last_name: dbUpdates.last_name,
        login_id: dbUpdates.login_id,
        email: dbUpdates.email,
        phone_number: dbUpdates.phone_number,
      },
    })

    // Update users table
    console.log('[updateUserAcrossTables] Updating users table...')
    const { error: usersUpdateError } = await supabaseClient
      .from('users')
      .update(dbUpdates)
      .eq('user_uid', userUid)

    if (usersUpdateError) {
      console.error('[updateUserAcrossTables] Error updating users table:', usersUpdateError)
      console.error('[updateUserAcrossTables] Error details:', {
        code: usersUpdateError.code,
        message: usersUpdateError.message,
        details: usersUpdateError.details,
        hint: usersUpdateError.hint,
      })
      return { success: false, error: 'Failed to update user data' }
    }

    console.log('[updateUserAcrossTables] Successfully updated users table')

    // Fetch the actual values that were stored in the users table
    // This is important because the database might have modified/truncated the values
    const { data: updatedUser, error: fetchUpdatedError } = await supabaseClient
      .from('users')
      .select('first_name, last_name, login_id, email, phone_number')
      .eq('user_uid', userUid)
      .single()

    if (fetchUpdatedError || !updatedUser) {
      console.error('[updateUserAcrossTables] Error fetching updated user data:', fetchUpdatedError)
      // Don't fail - use what we have in dbUpdates as fallback
    } else {
      console.log('[updateUserAcrossTables] Updated user data from database:', {
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        login_id: updatedUser.login_id,
        email: updatedUser.email,
        phone_number: updatedUser.phone_number,
      })
    }

    // Always update garage_auth table to keep it in sync with users table
    // Note: garage_auth only has authentication fields (user_uid, garage_id, garage_name, first_name, last_name, login_id, user_role)
    // It does NOT have email or phone_number - those stay in the users table
    const authUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    // Use the actual values from the database (after any database-level modifications)
    // Only add fields that were actually being updated
    if (dbUpdates.login_id) {
      authUpdates.login_id = updatedUser?.login_id || dbUpdates.login_id
      console.log('[updateUserAcrossTables] Syncing login_id:', authUpdates.login_id)
    }
    if (dbUpdates.first_name) {
      authUpdates.first_name = updatedUser?.first_name || dbUpdates.first_name
      console.log('[updateUserAcrossTables] Syncing first_name:', authUpdates.first_name)
    }
    if (dbUpdates.last_name) {
      authUpdates.last_name = updatedUser?.last_name || dbUpdates.last_name
      console.log('[updateUserAcrossTables] Syncing last_name:', authUpdates.last_name)
    }

    console.log('[updateUserAcrossTables] Prepared garage_auth updates:', authUpdates)
    console.log('[updateUserAcrossTables] Number of fields to sync:', Object.keys(authUpdates).length)

    // First check if the user exists in garage_auth
    const { data: existingAuthUser, error: checkError } = await supabaseClient
      .from('garage_auth')
      .select('user_uid, first_name, last_name, login_id, garage_name')
      .eq('user_uid', userUid)
      .maybeSingle()

    if (checkError) {
      console.error('[updateUserAcrossTables] Error checking garage_auth for user:', checkError)
    }

    if (!existingAuthUser) {
      console.warn('[updateUserAcrossTables] WARNING: User does not exist in garage_auth table. Creating new record...')
      // Create the record in garage_auth if it doesn't exist
      const { error: insertError } = await supabaseClient
        .from('garage_auth')
        .insert({
          user_uid: userUid,
          first_name: updatedUser?.first_name || currentUser.first_name,
          last_name: updatedUser?.last_name || currentUser.last_name,
          login_id: updatedUser?.login_id || currentUser.login_id,
          garage_id: currentUser.garage_id,
          garage_name: currentUser.garage_name,
          user_role: currentUser.user_role,
          password_hash: null,
          created_at: currentUser.created_at,
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('[updateUserAcrossTables] Error creating garage_auth record:', insertError)
        console.error('[updateUserAcrossTables] Error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        })
        return { success: false, error: 'Failed to create authentication record' }
      }

      console.log('[updateUserAcrossTables] Created garage_auth record for user:', userUid)
      return { success: true, newLoginId }
    }

    console.log('[updateUserAcrossTables] User exists in garage_auth, proceeding with update')
    console.log('[updateUserAcrossTables] Current garage_auth data:', existingAuthUser)

    // Only update if there are actual changes to sync (more than just updated_at)
    if (Object.keys(authUpdates).length > 1) {
      console.log('[updateUserAcrossTables] Syncing to garage_auth table for user_uid:', userUid)

      // Update garage_auth table using user_uid
      const { error: authUpdateError, data: authUpdateData, count } = await supabaseClient
        .from('garage_auth')
        .update(authUpdates)
        .eq('user_uid', userUid)
        .select('user_uid, first_name, last_name, login_id, updated_at')
        .single()

      if (authUpdateError) {
        console.error('[updateUserAcrossTables] Error updating garage_auth table:', authUpdateError)
        console.error('[updateUserAcrossTables] Error details:', {
          code: authUpdateError.code,
          message: authUpdateError.message,
          details: authUpdateError.details,
          hint: authUpdateError.hint,
        })
        // Note: We might want to rollback the users table update here,
        // but for simplicity we'll leave it and log the error
        return { success: false, error: 'Failed to update authentication data' }
      }

      console.log('[updateUserAcrossTables] Successfully updated garage_auth table')
      console.log('[updateUserAcrossTables] Update count:', count)
      console.log('[updateUserAcrossTables] Updated garage_auth record:', authUpdateData)

      // Verify the update by reading back the values
      const { data: verifyData, error: verifyError } = await supabaseClient
        .from('garage_auth')
        .select('first_name, last_name, login_id, updated_at')
        .eq('user_uid', userUid)
        .single()

      if (verifyError) {
        console.error('[updateUserAcrossTables] Error verifying garage_auth update:', verifyError)
      } else {
        console.log('[updateUserAcrossTables] Verified garage_auth values after update:', verifyData)
      }
    } else {
      console.log('[updateUserAcrossTables] No fields to sync to garage_auth (only updated_at)')
    }

    console.log('[updateUserAcrossTables] garage_auth updated successfully for user:', userUid)

    return { success: true, newLoginId }
  } catch (error) {
    console.error('[updateUserAcrossTables] Unexpected error in updateUserAcrossTables:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

