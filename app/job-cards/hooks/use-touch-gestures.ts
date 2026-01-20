/**
 * useTouchGestures Hook
 *
 * Provides touch gesture support for calendar navigation on mobile devices
 * Supports swipe left/right for date navigation
 */

'use client'

import { useRef, useCallback, useEffect } from 'react'

export interface TouchGestureHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onLongPress?: () => void
}

export interface UseTouchGesturesOptions {
  handlers: TouchGestureHandlers
  enabled?: boolean
  swipeThreshold?: number
  longPressDelay?: number
  preventDefault?: boolean
}

export interface TouchGestureState {
  isSwiping: boolean
  isLongPress: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
}

/**
 * Hook for touch gesture handling
 *
 * Features:
 * - Swipe detection with configurable threshold
 * - Long press detection
 * - Tap detection
 * - Touch target validation (minimum 44x44px for accessibility)
 */
export function useTouchGestures(options: UseTouchGesturesOptions) {
  const {
    handlers,
    enabled = true,
    swipeThreshold = 50,
    longPressDelay = 500,
    preventDefault = false,
  } = options

  const touchStartRef = useRef<{ x: number; y: number; timestamp: number } | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const stateRef = useRef<TouchGestureState>({
    isSwiping: false,
    isLongPress: false,
    direction: null,
  })

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!enabled) return

      const touch = event.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      }

      stateRef.current = {
        isSwiping: false,
        isLongPress: false,
        direction: null,
      }

      // Start long press timer
      if (handlers.onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          stateRef.current.isLongPress = true
          handlers.onLongPress?.()
        }, longPressDelay)
      }

      if (preventDefault) {
        event.preventDefault()
      }
    },
    [enabled, handlers, longPressDelay, preventDefault]
  )

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!enabled || !touchStartRef.current) return

      const touch = event.touches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      // Clear long press timer if user moves finger
      if (longPressTimerRef.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      if (preventDefault) {
        event.preventDefault()
      }
    },
    [enabled, longPressDelay, preventDefault]
  )

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!enabled || !touchStartRef.current) return

      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.timestamp

      // Check if it's a tap (minimal movement and short duration)
      if (
        Math.abs(deltaX) < 10 &&
        Math.abs(deltaY) < 10 &&
        deltaTime < 300 &&
        handlers.onTap &&
        !stateRef.current.isLongPress
      ) {
        handlers.onTap()
        touchStartRef.current = null
        return
      }

      // Determine swipe direction
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      if (Math.max(absDeltaX, absDeltaY) < swipeThreshold) {
        touchStartRef.current = null
        return
      }

      let direction: 'left' | 'right' | 'up' | 'down' | null = null

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          direction = 'right'
        } else {
          direction = 'left'
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          direction = 'down'
        } else {
          direction = 'up'
        }
      }

      stateRef.current.direction = direction
      stateRef.current.isSwiping = true

      // Trigger appropriate handler
      switch (direction) {
        case 'left':
          handlers.onSwipeLeft?.()
          break
        case 'right':
          handlers.onSwipeRight?.()
          break
        case 'up':
          handlers.onSwipeUp?.()
          break
        case 'down':
          handlers.onSwipeDown?.()
          break
      }

      touchStartRef.current = null
    },
    [enabled, handlers, swipeThreshold]
  )

  /**
   * Register touch event listeners
   */
  useEffect(() => {
    if (!enabled) return

    const element = document.activeElement || document.body

    element.addEventListener('touchstart', handleTouchStart as EventListener, { passive: !preventDefault })
    element.addEventListener('touchmove', handleTouchMove as EventListener, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true })
    element.addEventListener('touchcancel', handleTouchEnd as EventListener, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart as EventListener)
      element.removeEventListener('touchmove', handleTouchMove as EventListener)
      element.removeEventListener('touchend', handleTouchEnd as EventListener)
      element.removeEventListener('touchcancel', handleTouchEnd as EventListener)

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault])

  return {
    state: stateRef.current,
  }
}

/**
 * Hook for calendar-specific touch gestures
 */
export function useCalendarTouchGestures(
  onPrev: () => void,
  onNext: () => void,
  enabled = true
) {
  return useTouchGestures({
    enabled,
    handlers: {
      onSwipeLeft: onNext, // Swipe left = next
      onSwipeRight: onPrev, // Swipe right = prev
    },
    swipeThreshold: 75, // Higher threshold for calendar to prevent accidental swipes
    preventDefault: false, // Don't prevent default to allow scrolling
  })
}

/**
 * Validate touch target size for accessibility (WCAG 2.5.5)
 * Minimum touch target size: 44x44px
 */
export function validateTouchTargetSize(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  const minWidth = 44
  const minHeight = 44

  return rect.width >= minWidth && rect.height >= minHeight
}

/**
 * Enhance touch targets for accessibility
 * Adds padding to small elements to meet minimum size requirements
 */
export function enhanceTouchTargets(selector: string = '[data-touch-target]') {
  if (typeof document === 'undefined') return

  const elements = document.querySelectorAll(selector)

  elements.forEach((element) => {
    const htmlElement = element as HTMLElement

    if (!validateTouchTargetSize(htmlElement)) {
      const rect = htmlElement.getBoundingClientRect()
      const currentWidth = rect.width
      const currentHeight = rect.height

      // Add padding to meet minimum size
      const paddingX = Math.max(0, (44 - currentWidth) / 2)
      const paddingY = Math.max(0, (44 - currentHeight) / 2)

      htmlElement.style.paddingLeft = `${paddingX}px`
      htmlElement.style.paddingRight = `${paddingX}px`
      htmlElement.style.paddingTop = `${paddingY}px`
      htmlElement.style.paddingBottom = `${paddingY}px`
    }
  })
}
