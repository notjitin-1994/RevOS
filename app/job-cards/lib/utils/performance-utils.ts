/**
 * Performance Utilities
 *
 * Collection of performance optimization utilities
 * - Memoization helpers
 * - Debounce/throttle functions
 * - Performance monitoring
 */

/**
 * Debounce function - delays execution until after wait milliseconds have elapsed
 * since the last time the debounced function was called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, wait)
  }
}

/**
 * Throttle function - ensures execution at most once per wait milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  let timeoutId: NodeJS.Timeout | null = null

  return function throttled(...args: Parameters<T>) {
    const now = Date.now()
    const remaining = wait - (now - lastTime)

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastTime = now
      func(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now()
        timeoutId = null
        func(...args)
      }, remaining)
    }
  }
}

/**
 * Memoize function with custom key generator
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Performance measurement utility
 */
export class PerformanceMonitor {
  private marks = new Map<string, number>()

  /**
   * Mark the start of a performance measurement
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * Measure the time elapsed since the mark
   */
  measure(name: string): number {
    const startTime = this.marks.get(name)
    if (!startTime) {
      console.warn(`No mark found for: ${name}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.marks.delete(name)

    return duration
  }

  /**
   * Log the time elapsed since the mark
   */
  measureLog(name: string, label?: string): void {
    const duration = this.measure(name)
    const message = label || name
    console.log(`⏱️  ${message}: ${duration.toFixed(2)}ms`)
  }

  /**
   * Clear all marks
   */
  clear(): void {
    this.marks.clear()
  }
}

/**
 * Create a performance monitor instance
 */
export const perfMonitor = new PerformanceMonitor()

/**
 * Batch state updates to avoid multiple re-renders
 */
export function batchUpdates<T>(items: T[], batchSize: number, processor: (batch: T[]) => void) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    processor(batch)
  }
}

/**
 * Lazy load component data
 */
export function lazyLoad<T>(
  loader: () => Promise<T>,
  timeout = 5000
): Promise<T> {
  return Promise.race([
    loader(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Lazy load timeout')), timeout)
    ),
  ])
}

/**
 * Check if user is on a slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined' || !(navigator as any).connection) {
    return false
  }

  const connection = (navigator as any).connection
  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData === true
  )
}

/**
 * Check if device is low-end (based on hardware concurrency)
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined' || !navigator.hardwareConcurrency) {
    return false
  }

  return navigator.hardwareConcurrency <= 4
}

/**
 * Request animation frame throttle
 */
export function rafThrottle<T extends (...args: any[]) => any>(func: T): T {
  let rafId: number | null = null

  return ((...args: Parameters<T>) => {
    if (rafId !== null) {
      return
    }

    rafId = requestAnimationFrame(() => {
      func(...args)
      rafId = null
    })
  }) as T
}

/**
 * Detect if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
