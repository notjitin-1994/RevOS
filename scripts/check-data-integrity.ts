/**
 * Data Integrity Checker for Motorcycles Database
 *
 * This script checks for common data integrity issues:
 * - Models containing make names of other manufacturers
 * - Duplicate models within the same make
 * - Same model names across different makes
 * - Invalid year ranges
 * - Electric vehicles with engine displacement
 * - Inconsistent country of origin within makes
 * - Mismatched production status and year_end
 */

import { createClient } from '@supabase/supabase-js'

// Known manufacturer keywords that should NOT appear in model names
const MANUFACTURER_KEYWORDS = [
  'Ather',
  'Hero',
  'Honda',
  'Bajaj',
  'TVS',
  'Yamaha',
  'Suzuki',
  'Ola',
  'Royal Enfield',
  'KTM',
  'Ducati',
  'Kawasaki',
  'Jawa',
  'Yezdi',
  'Kinetic',
  'LML',
  'Vespa',
]

interface IntegrityIssue {
  type: string
  severity: 'error' | 'warning' | 'info'
  make: string
  model: string
  description: string
  suggestion: string
}

export class DataIntegrityChecker {
  private supabase: any
  private issues: IntegrityIssue[] = []

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async runAllChecks(): Promise<IntegrityIssue[]> {
    console.log('🔍 Starting data integrity check...\n')

    await this.checkManufacturerNamesInModels()
    await this.checkDuplicateModelsInMake()
    await this.checkSameModelAcrossMakes()
    await this.checkInvalidYearRanges()
    await this.checkElectricWithEngineDisplacement()
    await this.checkInconsistentCountries()
    await this.checkMismatchedProductionStatus()

    this.printSummary()
    return this.issues
  }

  /**
   * Check 1: Models containing manufacturer names (misclassification)
   */
  private async checkManufacturerNamesInModels(): Promise<void> {
    console.log('📋 Checking for manufacturer names in model names...')

    const { data: motorcycles, error } = await this.supabase
      .from('motorcycles')
      .select('make, model')

    if (error) {
      console.error('  ❌ Error fetching data:', error.message)
      return
    }

    motorcycles?.forEach((bike: any) => {
      MANUFACTURER_KEYWORDS.forEach(keyword => {
        // Skip if the keyword matches the bike's own make
        if (bike.make.includes(keyword)) return

        // Check if model contains the manufacturer keyword
        if (bike.model.toLowerCase().includes(keyword.toLowerCase())) {
          this.issues.push({
            type: 'manufacturer_in_model_name',
            severity: 'error',
            make: bike.make,
            model: bike.model,
            description: `Model name "${bike.model}" contains manufacturer name "${keyword}"`,
            suggestion: `Model should likely belong to "${keyword}" make, not "${bike.make}"`,
          })
        }
      })
    })

    console.log(`  ✓ Found ${this.issues.filter(i => i.type === 'manufacturer_in_model_name').length} issues\n`)
  }

  /**
   * Check 2: Duplicate model names within the same make
   */
  private async checkDuplicateModelsInMake(): Promise<void> {
    console.log('📋 Checking for duplicate models within makes...')

    const { data, error } = await this.supabase.rpc('check_duplicate_models', {
      _make: null, // Check all makes
    })

    if (error) {
      // Fallback to manual check if RPC doesn't exist
      const { data: motorcycles, error: fetchError } = await this.supabase
        .from('motorcycles')
        .select('make, model')

      if (!fetchError && motorcycles) {
        const modelMap = new Map<string, { make: string; count: number }>()

        motorcycles.forEach((bike: any) => {
          const key = `${bike.make}|${bike.model}`
          modelMap.set(key, {
            make: bike.make,
            count: (modelMap.get(key)?.count || 0) + 1,
          })
        })

        modelMap.forEach((value, key) => {
          if (value.count > 1) {
            const [make, model] = key.split('|')
            this.issues.push({
              type: 'duplicate_model',
              severity: 'error',
              make,
              model,
              description: `Duplicate model "${model}" found ${value.count} times in make "${make}"`,
              suggestion: 'Remove duplicate entries and keep only one',
            })
          }
        })
      }
    }

    console.log(`  ✓ Found ${this.issues.filter(i => i.type === 'duplicate_model').length} issues\n`)
  }

  /**
   * Check 3: Same model names across different makes
   */
  private async checkSameModelAcrossMakes(): Promise<void> {
    console.log('📋 Checking for same model names across makes...')

    const { data: motorcycles, error } = await this.supabase
      .from('motorcycles')
      .select('make, model')

    if (error) return

    const modelMakesMap = new Map<string, string[]>()

    motorcycles?.forEach((bike: any) => {
      if (!modelMakesMap.has(bike.model)) {
        modelMakesMap.set(bike.model, [])
      }
      modelMakesMap.get(bike.model)!.push(bike.make)
    })

    modelMakesMap.forEach((makes, model) => {
      if (makes.length > 1) {
        // Sort makes alphabetically for consistent output
        makes.sort()

        this.issues.push({
          type: 'same_model_different_makes',
          severity: 'warning',
          make: makes.join(', '),
          model,
          description: `Model "${model}" exists under multiple makes: ${makes.join(', ')}`,
          suggestion: 'Review if these are correctly classified or if they share the same model name',
        })
      }
    })

    console.log(`  ✓ Found ${this.issues.filter(i => i.type === 'same_model_different_makes').length} issues\n`)
  }

  /**
   * Check 4: Invalid year ranges
   */
  private async checkInvalidYearRanges(): Promise<void> {
    console.log('📋 Checking for invalid year ranges...')

    const { data: motorcycles, error } = await this.supabase
      .from('motorcycles')
      .select('make, model, year_start, year_end')
      .not('year_end', 'is', null)

    if (error) return

    motorcycles?.forEach((bike: any) => {
      if (bike.year_end < bike.year_start) {
        this.issues.push({
          type: 'invalid_year_range',
          severity: 'error',
          make: bike.make,
          model: bike.model,
          description: `Invalid year range: ${bike.year_start} - ${bike.year_end}`,
          suggestion: 'year_end cannot be before year_start',
        })
      }
    })

    console.log(`  ✓ Found ${this.issues.filter(i => i.type === 'invalid_year_range').length} issues\n`)
  }

  /**
   * Check 5: Electric vehicles with engine displacement
   */
  private async checkElectricWithEngineDisplacement(): Promise<void> {
    console.log('📋 Checking electric vehicles with engine displacement...')

    const { data: motorcycles, error } = await this.supabase
      .from('motorcycles')
      .select('make, model, category, engine_displacement_cc')
      .eq('category', 'Electric')
      .gt('engine_displacement_cc', 0)

    if (error) return

    motorcycles?.forEach((bike: any) => {
      this.issues.push({
        type: 'electric_with_engine',
        severity: 'error',
        make: bike.make,
        model: bike.model,
        description: `Electric vehicle has engine displacement of ${bike.engine_displacement_cc}cc`,
        suggestion: 'Electric vehicles should have engine_displacement_cc = 0',
      })
    })

    console.log(`  ✓ Found ${this.issues.filter(i => i.type === 'electric_with_engine').length} issues\n`)
  }

  /**
   * Check 6: Inconsistent country of origin within makes
   */
  private async checkInconsistentCountries(): Promise<void> {
    console.log('📋 Checking for inconsistent countries within makes...')

    const { data: motorcycles, error } = await this.supabase
      .from('motorcycles')
      .select('make, country_of_origin')

    if (error) return

    const makeCountriesMap = new Map<string, Set<string>>()

    motorcycles?.forEach((bike: any) => {
      if (!makeCountriesMap.has(bike.make)) {
        makeCountriesMap.set(bike.make, new Set())
      }
      makeCountriesMap.get(bike.make)!.add(bike.country_of_origin)
    })

    makeCountriesMap.forEach((countries, make) => {
      if (countries.size > 1) {
        const sortedCountries = Array.from(countries).sort()
        this.issues.push({
          type: 'inconsistent_country',
          severity: 'warning',
          make,
          model: 'N/A',
          description: `Make "${make}" has multiple countries: ${sortedCountries.join(', ')}`,
          suggestion: 'Verify if make operates in multiple countries or if data is inconsistent',
        })
      }
    })

    console.log(`  ✓ Found ${this.issues.filter(i => i.type === 'inconsistent_country').length} issues\n`)
  }

  /**
   * Check 7: Mismatched production status and year_end
   */
  private async checkMismatchedProductionStatus(): Promise<void> {
    console.log('📋 Checking for mismatched production status...')

    const { data: motorcycles, error } = await this.supabase
      .from('motorcycles')
      .select('make, model, production_status, year_end')

    if (error) return

    motorcycles?.forEach((bike: any) => {
      // Discontinued but no year_end
      if (bike.production_status === 'Discontinued' && !bike.year_end) {
        this.issues.push({
          type: 'discontinued_no_end_year',
          severity: 'warning',
          make: bike.make,
          model: bike.model,
          description: 'Model marked as Discontinued but has no year_end',
          suggestion: 'Set year_end to last production year or change status to "In Production"',
        })
      }

      // Has year_end but marked as In Production
      if (bike.year_end && bike.production_status === 'In Production') {
        this.issues.push({
          type: 'in_production_with_end_year',
          severity: 'warning',
          make: bike.make,
          model: bike.model,
          description: `Model has year_end (${bike.year_end}) but marked as In Production`,
          suggestion: 'Change status to "Discontinued" or remove year_end',
        })
      }
    })

    const relatedIssues = this.issues.filter(i =>
      i.type === 'discontinued_no_end_year' || i.type === 'in_production_with_end_year'
    )
    console.log(`  ✓ Found ${relatedIssues.length} issues\n`)
  }

  /**
   * Print summary of all issues found
   */
  private printSummary(): void {
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('📊 DATA INTEGRITY CHECK SUMMARY')
    console.log('═══════════════════════════════════════════════════════════════\n')

    const errors = this.issues.filter(i => i.severity === 'error')
    const warnings = this.issues.filter(i => i.severity === 'warning')
    const infos = this.issues.filter(i => i.severity === 'info')

    console.log(`❌ Errors:   ${errors.length}`)
    console.log(`⚠️  Warnings: ${warnings.length}`)
    console.log(`ℹ️  Info:     ${infos.length}`)
    console.log(`📋 Total:    ${this.issues.length}\n`)

    if (this.issues.length > 0) {
      console.log('═══════════════════════════════════════════════════════════════')
      console.log('ISSUES DETAILS')
      console.log('═══════════════════════════════════════════════════════════════\n')

      this.issues.forEach((issue, index) => {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'
        console.log(`${icon} [${index + 1}] ${issue.type}`)
        console.log(`   Make: ${issue.make}`)
        console.log(`   Model: ${issue.model}`)
        console.log(`   Description: ${issue.description}`)
        console.log(`   Suggestion: ${issue.suggestion}`)
        console.log()
      })
    } else {
      console.log('✅ No data integrity issues found!')
    }

    console.log('═══════════════════════════════════════════════════════════════\n')
  }

  /**
   * Export issues as JSON for further processing
   */
  exportIssues(): string {
    return JSON.stringify(this.issues, null, 2)
  }
}

// Run the checker if executed directly
if (require.main === module) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
    process.exit(1)
  }

  const checker = new DataIntegrityChecker(supabaseUrl, supabaseKey)

  checker.runAllChecks()
    .then((issues) => {
      if (issues.length > 0) {
        process.exit(1) // Exit with error code if issues found
      } else {
        process.exit(0)
      }
    })
    .catch((error) => {
      console.error('❌ Error running data integrity check:', error)
      process.exit(1)
    })
}
