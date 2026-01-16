/**
 * Comprehensive validation utilities for garage business details
 * Industry-standard validation covering all use cases and data entry scenarios
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}

/**
 * GSTIN (Goods and Services Tax Identification Number) validation for India
 * Format: 2 character state code + 10 digit PAN + 1 alphanumeric + 1 check digit
 * Example: 29ABCDE1234F1Z5
 */
export function validateGSTIN(gstin: string): ValidationResult {
  if (!gstin || !gstin.trim()) {
    return { isValid: true } // GSTIN is optional
  }

  const trimmed = gstin.trim().toUpperCase()

  // Basic format check - 15 characters
  if (trimmed.length !== 15) {
    return {
      isValid: false,
      error: 'GSTIN must be exactly 15 characters long'
    }
  }

  // GSTIN format: [0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/

  if (!gstinRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid GSTIN format. Example: 29ABCDE1234F1Z5'
    }
  }

  return { isValid: true }
}

/**
 * PAN (Permanent Account Number) validation for India
 * Format: 5 letters + 4 digits + 1 letter
 * Example: ABCDE1234F
 */
export function validatePAN(pan: string): ValidationResult {
  if (!pan || !pan.trim()) {
    return { isValid: true } // PAN is optional
  }

  const trimmed = pan.trim().toUpperCase()

  // Basic format check - 10 characters
  if (trimmed.length !== 10) {
    return {
      isValid: false,
      error: 'PAN must be exactly 10 characters long'
    }
  }

  // PAN format: [A-Z]{5}[0-9]{4}[A-Z]{1}
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

  if (!panRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid PAN format. Example: ABCDE1234F'
    }
  }

  return { isValid: true }
}

/**
 * Business Registration Number validation
 * Supports various formats for different business types
 */
export function validateBusinessRegistrationNumber(regNumber: string): ValidationResult {
  if (!regNumber || !regNumber.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = regNumber.trim()

  // Minimum and maximum length check
  if (trimmed.length < 5 || trimmed.length > 50) {
    return {
      isValid: false,
      error: 'Business registration number must be between 5 and 50 characters'
    }
  }

  // Allow alphanumeric, spaces, hyphens, and slashes (common in registration numbers)
  const regNumberRegex = /^[A-Za-z0-9\s\-\/]+$/

  if (!regNumberRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Business registration number can only contain letters, numbers, spaces, hyphens, and slashes'
    }
  }

  return { isValid: true }
}

/**
 * Business Type validation
 * Standard business types for automotive industry
 */
export const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'Limited Liability Partnership (LLP)',
  'Private Limited Company',
  'Public Limited Company',
  'One Person Company',
  'Hindu Undivided Family (HUF)',
] as const

export function validateBusinessType(businessType: string): ValidationResult {
  if (!businessType || !businessType.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = businessType.trim()

  // Check if it's one of the standard business types
  if (BUSINESS_TYPES.includes(trimmed as any)) {
    return { isValid: true }
  }

  // Allow custom business types with validation
  if (trimmed.length < 2 || trimmed.length > 100) {
    return {
      isValid: false,
      error: 'Business type must be between 2 and 100 characters'
    }
  }

  // Allow letters, numbers, spaces, parentheses, and common punctuation
  const businessTypeRegex = /^[A-Za-z0-9\s\(\)\.\,\-]+$/

  if (!businessTypeRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Business type contains invalid characters'
    }
  }

  return {
    isValid: true,
    warning: 'Custom business type entered'
  }
}

/**
 * Year Established validation
 * Must be a valid year between 1900 and current year
 */
export function validateYearEstablished(year: string): ValidationResult {
  if (!year || !year.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = year.trim()
  const currentYear = new Date().getFullYear()
  const yearNum = parseInt(trimmed, 10)

  // Check if it's a valid number
  if (isNaN(yearNum)) {
    return {
      isValid: false,
      error: 'Year must be a valid number'
    }
  }

  // Check year range
  if (yearNum < 1900) {
    return {
      isValid: false,
      error: 'Year cannot be before 1900'
    }
  }

  if (yearNum > currentYear) {
    return {
      isValid: false,
      error: `Year cannot be in the future (max: ${currentYear})`
    }
  }

  // Check format (4 digits)
  if (!/^\d{4}$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Year must be in 4-digit format (e.g., 2010)'
    }
  }

  return { isValid: true }
}

/**
 * Website URL validation
 */
export function validateWebsite(website: string): ValidationResult {
  if (!website || !website.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = website.trim()

  // Add protocol if missing
  let urlToValidate = trimmed
  if (!/^https?:\/\//i.test(trimmed)) {
    urlToValidate = 'https://' + trimmed
  }

  try {
    const url = new URL(urlToValidate)

    // Check for valid protocol
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        isValid: false,
        error: 'Website must use HTTP or HTTPS protocol'
      }
    }

    // Check for valid hostname
    if (!url.hostname || !url.hostname.includes('.')) {
      return {
        isValid: false,
        error: 'Invalid website domain'
      }
    }

    // Check TLD (at least 2 characters)
    const tld = url.hostname.split('.').pop()
    if (!tld || tld.length < 2) {
      return {
        isValid: false,
        error: 'Invalid website TLD'
      }
    }

    return { isValid: true }
  } catch (e) {
    return {
      isValid: false,
      error: 'Invalid website URL. Example: www.example.com or https://example.com'
    }
  }
}

/**
 * Service Types validation (comma-separated string or array)
 */
export const AUTOMOTIVE_SERVICE_TYPES = [
  'General Repairs',
  'Engine Diagnostics',
  'Brake Services',
  'Oil Change',
  'Tire Services',
  'Alignment',
  'AC Repair',
  'Electrical',
  'Transmission',
  'Suspension',
  'Exhaust',
  'Battery Services',
  'Car Wash',
  'Detailing',
  'Paint',
  'Body Work',
  'Glass Replacement',
  'Inspection',
  'Custom Modifications',
] as const

export function validateServiceTypes(serviceTypes: string | string[]): ValidationResult {
  if (!serviceTypes || (typeof serviceTypes === 'string' && !serviceTypes.trim())) {
    return { isValid: true } // Optional field
  }

  // Convert to array if string
  const types = typeof serviceTypes === 'string'
    ? serviceTypes.split(',').map(s => s.trim()).filter(s => s)
    : serviceTypes

  // Check if empty after splitting
  if (types.length === 0) {
    return { isValid: true }
  }

  // Maximum limit
  if (types.length > 50) {
    return {
      isValid: false,
      error: 'Cannot have more than 50 service types'
    }
  }

  // Validate each service type
  for (const type of types) {
    if (type.length < 2 || type.length > 100) {
      return {
        isValid: false,
        error: 'Each service type must be between 2 and 100 characters'
      }
    }

    // Allow letters, numbers, spaces, and common punctuation
    const serviceTypeRegex = /^[A-Za-z0-9\s\&\/\-\.\,]+$/

    if (!serviceTypeRegex.test(type)) {
      return {
        isValid: false,
        error: `Service type "${type}" contains invalid characters`
      }
    }
  }

  return { isValid: true }
}

/**
 * Vehicle Types Serviced validation
 */
export const VEHICLE_TYPES = [
  'Hatchback',
  'Sedan',
  'SUV',
  'MUV',
  'Coupe',
  'Convertible',
  'Wagon',
  'Van',
  'Minivan',
  'Truck',
  'Pickup Truck',
  'Electric Vehicle',
  'Hybrid',
  'Motorcycle',
  'Scooter',
  'Three-Wheeler',
  'Commercial Vehicle',
  'Heavy Vehicle',
  'Bus',
  'Tractor',
  'RV',
  'Camper',
] as const

export function validateVehicleTypes(vehicleTypes: string | string[]): ValidationResult {
  if (!vehicleTypes || (typeof vehicleTypes === 'string' && !vehicleTypes.trim())) {
    return { isValid: true } // Optional field
  }

  // Convert to array if string
  const types = typeof vehicleTypes === 'string'
    ? vehicleTypes.split(',').map(s => s.trim()).filter(s => s)
    : vehicleTypes

  // Check if empty after splitting
  if (types.length === 0) {
    return { isValid: true }
  }

  // Maximum limit
  if (types.length > 30) {
    return {
      isValid: false,
      error: 'Cannot have more than 30 vehicle types'
    }
  }

  // Validate each vehicle type
  for (const type of types) {
    if (type.length < 2 || type.length > 50) {
      return {
        isValid: false,
        error: 'Each vehicle type must be between 2 and 50 characters'
      }
    }

    // Allow letters, numbers, spaces, and common punctuation
    const vehicleTypeRegex = /^[A-Za-z0-9\s\-\.\,]+$/

    if (!vehicleTypeRegex.test(type)) {
      return {
        isValid: false,
        error: `Vehicle type "${type}" contains invalid characters`
      }
    }
  }

  return { isValid: true }
}

/**
 * Number of Service Bays validation
 */
export function validateNumberOfServiceBays(num: string): ValidationResult {
  if (!num || !num.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = num.trim()
  const numValue = parseInt(trimmed, 10)

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: 'Number of service bays must be a valid number'
    }
  }

  // Check range
  if (numValue < 1) {
    return {
      isValid: false,
      error: 'Must have at least 1 service bay'
    }
  }

  if (numValue > 100) {
    return {
      isValid: false,
      error: 'Number of service bays cannot exceed 100'
    }
  }

  return { isValid: true }
}

/**
 * Certifications validation (comma-separated string or array)
 */
export function validateCertifications(certifications: string | string[]): ValidationResult {
  if (!certifications || (typeof certifications === 'string' && !certifications.trim())) {
    return { isValid: true } // Optional field
  }

  // Convert to array if string
  const certs = typeof certifications === 'string'
    ? certifications.split(',').map(s => s.trim()).filter(s => s)
    : certifications

  // Check if empty after splitting
  if (certs.length === 0) {
    return { isValid: true }
  }

  // Maximum limit
  if (certs.length > 30) {
    return {
      isValid: false,
      error: 'Cannot have more than 30 certifications'
    }
  }

  // Validate each certification
  for (const cert of certs) {
    if (cert.length < 3 || cert.length > 100) {
      return {
        isValid: false,
        error: 'Each certification must be between 3 and 100 characters'
      }
    }

    // Allow letters, numbers, spaces, and common punctuation
    const certRegex = /^[A-Za-z0-9\s\(\)\[\]\{\}\.\,\-\&\/]+$/

    if (!certRegex.test(cert)) {
      return {
        isValid: false,
        error: `Certification "${cert}" contains invalid characters`
      }
    }
  }

  return { isValid: true }
}

/**
 * Insurance Details validation
 */
export function validateInsuranceDetails(details: string): ValidationResult {
  if (!details || !details.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = details.trim()

  // Length check
  if (trimmed.length < 10 || trimmed.length > 500) {
    return {
      isValid: false,
      error: 'Insurance details must be between 10 and 500 characters'
    }
  }

  return { isValid: true }
}

/**
 * Payment Methods validation (comma-separated string or array)
 */
export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Cheque',
  'Digital Wallet',
  'Paytm',
  'Google Pay',
  'PhonePe',
  'Amazon Pay',
  'BHIM',
  'Mobile Payment',
  'Bank Transfer',
  'EMI',
] as const

export function validatePaymentMethods(methods: string | string[]): ValidationResult {
  if (!methods || (typeof methods === 'string' && !methods.trim())) {
    return { isValid: true } // Optional field
  }

  // Convert to array if string
  const paymentMethods = typeof methods === 'string'
    ? methods.split(',').map(s => s.trim()).filter(s => s)
    : methods

  // Check if empty after splitting
  if (paymentMethods.length === 0) {
    return { isValid: true }
  }

  // Maximum limit
  if (paymentMethods.length > 20) {
    return {
      isValid: false,
      error: 'Cannot have more than 20 payment methods'
    }
  }

  // Validate each payment method
  for (const method of paymentMethods) {
    if (method.length < 2 || method.length > 50) {
      return {
        isValid: false,
        error: 'Each payment method must be between 2 and 50 characters'
      }
    }

    // Allow letters, numbers, spaces, and common punctuation
    const methodRegex = /^[A-Za-z0-9\s\.\,\-]+$/

    if (!methodRegex.test(method)) {
      return {
        isValid: false,
        error: `Payment method "${method}" contains invalid characters`
      }
    }
  }

  return { isValid: true }
}

/**
 * Bank Name validation
 */
export function validateBankName(bankName: string): ValidationResult {
  if (!bankName || !bankName.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = bankName.trim()

  // Length check
  if (trimmed.length < 3 || trimmed.length > 100) {
    return {
      isValid: false,
      error: 'Bank name must be between 3 and 100 characters'
    }
  }

  // Allow letters, numbers, spaces, and common punctuation
  const bankNameRegex = /^[A-Za-z0-9\s\.\,\-\&]+$/

  if (!bankNameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Bank name contains invalid characters'
    }
  }

  return { isValid: true }
}

/**
 * Account Number validation
 */
export function validateAccountNumber(accountNumber: string): ValidationResult {
  if (!accountNumber || !accountNumber.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = accountNumber.trim().replace(/\s/g, '')

  // Length check (typical Indian bank account length: 9-18 digits)
  if (trimmed.length < 9 || trimmed.length > 18) {
    return {
      isValid: false,
      error: 'Account number must be between 9 and 18 digits'
    }
  }

  // Must be numeric
  if (!/^\d+$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Account number can only contain digits'
    }
  }

  return { isValid: true }
}

/**
 * IFSC Code validation (Indian Financial System Code)
 * Format: 4 letter bank code + 0 + 6 letter branch code
 * Example: SBIN0001234
 */
export function validateIFSCCode(ifsc: string): ValidationResult {
  if (!ifsc || !ifsc.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = ifsc.trim().toUpperCase()

  // Length check
  if (trimmed.length !== 11) {
    return {
      isValid: false,
      error: 'IFSC code must be exactly 11 characters (e.g., SBIN0001234)'
    }
  }

  // IFSC format: [A-Z]{4}0[A-Z0-9]{6}
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/

  if (!ifscRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid IFSC format. Example: SBIN0001234'
    }
  }

  return { isValid: true }
}

/**
 * Branch validation
 */
export function validateBranch(branch: string): ValidationResult {
  if (!branch || !branch.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = branch.trim()

  // Length check
  if (trimmed.length < 2 || trimmed.length > 100) {
    return {
      isValid: false,
      error: 'Branch name must be between 2 and 100 characters'
    }
  }

  // Allow letters, numbers, spaces, and common punctuation
  const branchRegex = /^[A-Za-z0-9\s\.\,\-\(\)]+$/

  if (!branchRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Branch name contains invalid characters'
    }
  }

  return { isValid: true }
}

/**
 * Default Labor Rate validation
 */
export function validateDefaultLaborRate(rate: string): ValidationResult {
  if (!rate || !rate.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = rate.trim()

  // Check if it's a valid currency amount
  const rateRegex = /^\d+(\.\d{1,2})?$/

  if (!rateRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Labor rate must be a valid amount (e.g., 500 or 500.50)'
    }
  }

  const rateValue = parseFloat(trimmed)

  // Check range
  if (rateValue < 0) {
    return {
      isValid: false,
      error: 'Labor rate cannot be negative'
    }
  }

  if (rateValue > 100000) {
    return {
      isValid: false,
      error: 'Labor rate seems unusually high. Please verify.'
    }
  }

  return { isValid: true }
}

/**
 * Invoice Prefix validation
 */
export function validateInvoicePrefix(prefix: string): ValidationResult {
  if (!prefix || !prefix.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = prefix.trim()

  // Length check
  if (trimmed.length < 1 || trimmed.length > 10) {
    return {
      isValid: false,
      error: 'Invoice prefix must be between 1 and 10 characters'
    }
  }

  // Allow alphanumeric characters, hyphens, and underscores
  const prefixRegex = /^[A-Za-z0-9\-_]+$/

  if (!prefixRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invoice prefix can only contain letters, numbers, hyphens, and underscores'
    }
  }

  return { isValid: true }
}

/**
 * Parking Capacity validation
 */
export function validateParkingCapacity(capacity: string): ValidationResult {
  if (!capacity || !capacity.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = capacity.trim()
  const capacityValue = parseInt(trimmed, 10)

  // Check if it's a valid number
  if (isNaN(capacityValue)) {
    return {
      isValid: false,
      error: 'Parking capacity must be a valid number'
    }
  }

  // Check range
  if (capacityValue < 0) {
    return {
      isValid: false,
      error: 'Parking capacity cannot be negative'
    }
  }

  if (capacityValue > 500) {
    return {
      isValid: false,
      error: 'Parking capacity cannot exceed 500 vehicles'
    }
  }

  return { isValid: true }
}

/**
 * Waiting Area Amenities validation (comma-separated string or array)
 */
export const WAITING_AMENITIES = [
  'WiFi',
  'Television',
  'Magazines',
  'Refreshments',
  'AC',
  'Seating Area',
  'Restroom',
  'Charging Points',
  'Kids Play Area',
  'Coffee Machine',
  'Water Dispenser',
  'Newspapers',
] as const

export function validateWaitingAreaAmenities(amenities: string | string[]): ValidationResult {
  if (!amenities || (typeof amenities === 'string' && !amenities.trim())) {
    return { isValid: true } // Optional field
  }

  // Convert to array if string
  const amenityList = typeof amenities === 'string'
    ? amenities.split(',').map(s => s.trim()).filter(s => s)
    : amenities

  // Check if empty after splitting
  if (amenityList.length === 0) {
    return { isValid: true }
  }

  // Maximum limit
  if (amenityList.length > 30) {
    return {
      isValid: false,
      error: 'Cannot have more than 30 amenities'
    }
  }

  // Validate each amenity
  for (const amenity of amenityList) {
    if (amenity.length < 2 || amenity.length > 50) {
      return {
        isValid: false,
        error: 'Each amenity must be between 2 and 50 characters'
      }
    }

    // Allow letters, numbers, spaces, and common punctuation
    const amenityRegex = /^[A-Za-z0-9\s\.\,\-]+$/

    if (!amenityRegex.test(amenity)) {
      return {
        isValid: false,
        error: `Amenity "${amenity}" contains invalid characters`
      }
    }
  }

  return { isValid: true }
}

/**
 * Operating Hours validation
 * Format: "HH:MM AM/PM - HH:MM AM/PM" or "Closed"
 */
export function validateOperatingHours(hours: string): ValidationResult {
  if (!hours || !hours.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = hours.trim()

  // Allow "Closed" as a valid value
  if (trimmed.toLowerCase() === 'closed' || trimmed.toLowerCase() === 'not available') {
    return { isValid: true }
  }

  // Check format: "HH:MM AM/PM - HH:MM AM/PM"
  const timeRangeRegex = /^(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm))\s*[-–to]+\s*(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm))$/i

  const match = trimmed.match(timeRangeRegex)
  if (!match) {
    return {
      isValid: false,
      error: 'Operating hours must be in format "9:00 AM - 6:00 PM" or "Closed"'
    }
  }

  // Validate individual times
  const timeRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i

  const startTime = match[1].trim().toUpperCase()
  const endTime = match[2].trim().toUpperCase()

  const startMatch = startTime.match(timeRegex)
  const endMatch = endTime.match(timeRegex)

  if (!startMatch || !endMatch) {
    return {
      isValid: false,
      error: 'Invalid time format. Use "HH:MM AM/PM" format'
    }
  }

  // Validate hours and minutes
  const startHour = parseInt(startMatch[1], 10)
  const startMin = parseInt(startMatch[2], 10)
  const endHour = parseInt(endMatch[1], 10)
  const endMin = parseInt(endMatch[2], 10)

  if (startHour < 1 || startHour > 12 || startMin < 0 || startMin > 59) {
    return {
      isValid: false,
      error: 'Invalid start time'
    }
  }

  if (endHour < 1 || endHour > 12 || endMin < 0 || endMin > 59) {
    return {
      isValid: false,
      error: 'Invalid end time'
    }
  }

  return { isValid: true }
}

/**
 * Tax Rate validation
 */
export function validateTaxRate(rate: string): ValidationResult {
  if (!rate || !rate.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = rate.trim()

  // Allow percentage or decimal
  const rateRegex = /^(\d+(\.\d{1,2})?|\d+%)$/

  if (!rateRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Tax rate must be a valid percentage (e.g., 18 or 18% or 18.5)'
    }
  }

  let rateValue: number
  if (trimmed.includes('%')) {
    rateValue = parseFloat(trimmed.replace('%', ''))
  } else {
    rateValue = parseFloat(trimmed)
  }

  // Check range
  if (rateValue < 0 || rateValue > 100) {
    return {
      isValid: false,
      error: 'Tax rate must be between 0 and 100%'
    }
  }

  return { isValid: true }
}

/**
 * Currency validation
 */
export const COMMON_CURRENCIES = [
  'INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD',
  'SGD', 'NZD', 'SEK', 'NOK', 'DKK', 'AED', 'SAR', 'QAR', 'KWD', 'BHD',
  'OMR', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'KRW', 'TWD', 'RUB', 'BRL',
  'MXN', 'ZAR', 'EGP', 'NGN', 'KES', 'GHS', 'PKR', 'LKR', 'BDT', 'NPR',
] as const

export function validateCurrency(currency: string): ValidationResult {
  if (!currency || !currency.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = currency.trim().toUpperCase()

  // Check length (ISO 4217 currency codes are 3 letters)
  if (trimmed.length !== 3) {
    return {
      isValid: false,
      error: 'Currency code must be 3 characters (e.g., INR, USD)'
    }
  }

  // Check if it's a valid ISO 4217 currency code format
  const currencyRegex = /^[A-Z]{3}$/

  if (!currencyRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid currency code format. Use 3-letter ISO code (e.g., INR)'
    }
  }

  return { isValid: true }
}

/**
 * Billing Cycle validation
 */
export const BILLING_CYCLES = [
  'Daily',
  'Weekly',
  'Bi-Weekly',
  'Monthly',
  'Quarterly',
  'Semi-Annually',
  'Annually',
  'On Delivery',
  'On Completion',
  'Advance Payment',
] as const

export function validateBillingCycle(cycle: string): ValidationResult {
  if (!cycle || !cycle.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = cycle.trim()

  // Length check
  if (trimmed.length < 2 || trimmed.length > 50) {
    return {
      isValid: false,
      error: 'Billing cycle must be between 2 and 50 characters'
    }
  }

  // Allow letters, numbers, spaces, and common punctuation
  const cycleRegex = /^[A-Za-z0-9\s\-\.\,]+$/

  if (!cycleRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Billing cycle contains invalid characters'
    }
  }

  return { isValid: true }
}

/**
 * Credit Terms validation
 */
export function validateCreditTerms(terms: string): ValidationResult {
  if (!terms || !terms.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = terms.trim()

  // Length check
  if (trimmed.length < 2 || trimmed.length > 200) {
    return {
      isValid: false,
      error: 'Credit terms must be between 2 and 200 characters'
    }
  }

  // Allow letters, numbers, spaces, and common punctuation
  const termsRegex = /^[A-Za-z0-9\s\(\)\[\]\{\}\.\,\:\-\&\/]+$/

  if (!termsRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Credit terms contain invalid characters'
    }
  }

  return { isValid: true }
}

/**
 * Notes validation
 */
export function validateNotes(notes: string): ValidationResult {
  if (!notes || !notes.trim()) {
    return { isValid: true } // Optional field
  }

  const trimmed = notes.trim()

  // Length check
  if (trimmed.length > 2000) {
    return {
      isValid: false,
      error: 'Notes cannot exceed 2000 characters'
    }
  }

  return { isValid: true }
}

/**
 * Comprehensive garage field validation
 * Routes to appropriate validation function based on field name
 */
export function validateGarageField(field: string, value: string): ValidationResult {
  if (!value || !value.trim()) {
    // For optional fields, empty is valid
    // For required fields, add validation here
    return { isValid: true }
  }

  switch (field) {
    case 'gstin':
      return validateGSTIN(value)

    case 'panNumber':
      return validatePAN(value)

    case 'businessRegistrationNumber':
      return validateBusinessRegistrationNumber(value)

    case 'businessType':
      return validateBusinessType(value)

    case 'yearEstablished':
      return validateYearEstablished(value)

    case 'website':
      return validateWebsite(value)

    case 'serviceTypes':
      return validateServiceTypes(value)

    case 'vehicleTypesServiced':
      return validateVehicleTypes(value)

    case 'numberOfServiceBays':
      return validateNumberOfServiceBays(value)

    case 'certifications':
      return validateCertifications(value)

    case 'insuranceDetails':
      return validateInsuranceDetails(value)

    case 'paymentMethods':
      return validatePaymentMethods(value)

    case 'bankName':
      return validateBankName(value)

    case 'accountNumber':
      return validateAccountNumber(value)

    case 'ifscCode':
      return validateIFSCCode(value)

    case 'branch':
      return validateBranch(value)

    case 'defaultLaborRate':
      return validateDefaultLaborRate(value)

    case 'invoicePrefix':
      return validateInvoicePrefix(value)

    case 'parkingCapacity':
      return validateParkingCapacity(value)

    case 'waitingAreaAmenities':
      return validateWaitingAreaAmenities(value)

    case 'taxRate':
      return validateTaxRate(value)

    case 'currency':
      return validateCurrency(value)

    case 'billingCycle':
      return validateBillingCycle(value)

    case 'creditTerms':
      return validateCreditTerms(value)

    case 'notes':
      return validateNotes(value)

    // Operating hours fields
    case 'operatingHours.weekdays':
    case 'operatingHours.saturday':
    case 'operatingHours.sunday':
      return validateOperatingHours(value)

    // Contact information fields (basic validation)
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return { isValid: false, error: 'Please enter a valid email address' }
      }
      return { isValid: true }

    case 'phoneNumber':
    case 'alternatePhoneNumber':
    case 'whatsappNumber':
      const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/
      if (!phoneRegex.test(value)) {
        return { isValid: false, error: 'Please enter a valid phone number (10-15 digits)' }
      }
      return { isValid: true }

    case 'zipCode':
      const zipRegex = /^[a-zA-Z0-9\s\-]{3,10}$/
      if (!zipRegex.test(value)) {
        return { isValid: false, error: 'Please enter a valid postal code' }
      }
      return { isValid: true }

    default:
      // Default validation for text fields
      if (value.length > 500) {
        return { isValid: false, error: 'This field cannot exceed 500 characters' }
      }
      return { isValid: true }
  }
}
