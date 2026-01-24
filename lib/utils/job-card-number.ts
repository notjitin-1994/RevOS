import { createAdminClient } from '@/lib/supabase/server'

/**
 * Generates a unique job card number in the format: JC-YYYYMMDD-SEQUENCE
 *
 * Format: JC-20250124-0001
 * - JC: Static prefix
 * - YYYYMMDD: Current date
 * - SEQUENCE: 4-digit sequence number (starts at 0001)
 *
 * The sequence number is per-garage and per-day, so each garage starts
 * from 0001 each day.
 *
 * @param garageId - The garage ID to generate the job card number for
 * @returns A unique job card number string
 * @throws Error if unable to generate a unique number after 5 attempts
 *
 * @example
 * ```ts
 * const jobCardNumber = await generateJobCardNumber('garage-uuid')
 * // Returns: "JC-20250124-0001"
 * ```
 */
export async function generateJobCardNumber(garageId: string): Promise<string> {
  const supabase = createAdminClient()

  // Get today's date in YYYYMMDD format
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  // Retry logic for handling duplicate number collisions
  const maxRetries = 5
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Query existing job cards for this garage on this date to determine next sequence
      const { data: existingCards, error: queryError } = await supabase
        .from('job_cards')
        .select('job_card_number')
        .eq('garage_id', garageId)
        .like('job_card_number', `JC-${dateStr}-%`)
        .order('job_card_number', { ascending: false })
        .limit(1)

      if (queryError) {
        throw new Error(`Failed to query existing job cards: ${queryError.message}`)
      }

      // Determine next sequence number
      let nextSequence = 1
      if (existingCards && existingCards.length > 0) {
        const lastNumber = existingCards[0].job_card_number
        const lastSequence = parseInt(lastNumber.split('-')[2], 10)
        if (!isNaN(lastSequence)) {
          nextSequence = lastSequence + 1
        }
      }

      // Format sequence as 4-digit number (0001, 0002, etc.)
      const sequenceStr = String(nextSequence).padStart(4, '0')

      // Generate the full job card number
      const jobCardNumber = `JC-${dateStr}-${sequenceStr}`

      // Verify this number doesn't exist (handle race conditions)
      const { data: existingCard, error: checkError } = await supabase
        .from('job_cards')
        .select('id')
        .eq('job_card_number', jobCardNumber)
        .maybeSingle()

      if (checkError) {
        throw new Error(`Failed to check for existing job card: ${checkError.message}`)
      }

      if (existingCard) {
        // Number already exists, try again with incremented sequence
        console.warn(`Job card number ${jobCardNumber} already exists, retrying (attempt ${attempt}/${maxRetries})`)
        lastError = new Error(`Job card number collision: ${jobCardNumber}`)
        continue
      }

      // Successfully generated a unique job card number
      console.log(`Generated job card number: ${jobCardNumber} (attempt ${attempt}/${maxRetries})`)
      return jobCardNumber

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Error generating job card number (attempt ${attempt}/${maxRetries}):`, error)

      if (attempt === maxRetries) {
        break
      }
    }
  }

  // Failed to generate a unique number after all retries
  throw new Error(
    `Failed to generate unique job card number after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`
  )
}

/**
 * Validates a job card number format
 *
 * @param jobCardNumber - The job card number to validate
 * @returns True if the format is valid
 *
 * @example
 * ```ts
 * isValidJobCardNumber('JC-20250124-0001') // true
 * isValidJobCardNumber('JC-20250124-1')    // false (sequence not 4 digits)
 * isValidJobCardNumber('JC-2025-01-24-0001') // false (wrong date format)
 * ```
 */
export function isValidJobCardNumber(jobCardNumber: string): boolean {
  const pattern = /^JC-\d{8}-\d{4}$/
  return pattern.test(jobCardNumber)
}

/**
 * Extracts the date from a job card number
 *
 * @param jobCardNumber - The job card number to extract date from
 * @returns Date object or null if invalid format
 *
 * @example
 * ```ts
 * const date = extractDateFromJobCardNumber('JC-20250124-0001')
 * // Returns: Date object for January 24, 2025
 * ```
 */
export function extractDateFromJobCardNumber(jobCardNumber: string): Date | null {
  if (!isValidJobCardNumber(jobCardNumber)) {
    return null
  }

  const dateStr = jobCardNumber.split('-')[1]
  const year = parseInt(dateStr.substring(0, 4), 10)
  const month = parseInt(dateStr.substring(4, 6), 10) - 1 // Months are 0-indexed
  const day = parseInt(dateStr.substring(6, 8), 10)

  return new Date(year, month, day)
}
