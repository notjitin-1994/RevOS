'use client'

import { useEffect, useRef } from 'react'

/**
 * Particle class for background animation
 */
class Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number

  constructor(canvas: HTMLCanvasElement, minSpeed: number, maxSpeed: number, minSize: number, maxSize: number, maxOpacity: number) {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.vx = (Math.random() - 0.5) * (maxSpeed - minSpeed) + minSpeed
    this.vy = (Math.random() - 0.5) * (maxSpeed - minSpeed) + minSpeed
    this.size = Math.random() * (maxSize - minSize) + minSize
    this.opacity = maxOpacity
  }

  update(canvas: HTMLCanvasElement) {
    // Move particle
    this.x += this.vx
    this.y += this.vy

    // Wrap around screen edges
    if (this.x < 0) this.x = canvas.width
    if (this.x > canvas.width) this.x = 0
    if (this.y < 0) this.y = canvas.height
    if (this.y > canvas.height) this.y = 0
  }

  draw(ctx: CanvasRenderingContext2D, glowBlur: number) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)

    // Brand Lime color at full opacity
    ctx.fillStyle = `rgba(204, 255, 0, ${this.opacity})`

    // Enhanced glow effect with brand lime
    ctx.shadowBlur = glowBlur
    ctx.shadowColor = `rgba(204, 255, 0, 0.6)`

    ctx.fill()
    ctx.shadowBlur = 0 // Reset for performance
  }
}

/**
 * Glowing Dots Background Animation
 *
 * Features:
 * - Subtle, randomized glowing dots
 * - Slow, gentle movement for aesthetic appeal
 * - Canvas-based for optimal performance (60fps)
 * - Responsive to window resize
 * - Matches RevOS Digital Volt theme
 * - Proper React cleanup to prevent memory leaks
 *
 * Design System: Digital Volt
 * - Dot color: Brand Lime (#CCFF00) with low opacity
 * - Glow effect: Canvas shadowBlur
 * - Background: Transparent (shows bg-graphite-900 through)
 * - Philosophy: Industrial precision meets digital elegance
 */
export function GlowingDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()

    // Particle configuration
    const PARTICLE_COUNT = 100 // Increased for more visual interest
    const MIN_SIZE = 1
    const MAX_SIZE = 3
    const MIN_SPEED = 0.1
    const MAX_SPEED = 0.3
    const MIN_OPACITY = 1.0 // Full opacity
    const MAX_OPACITY = 1.0 // Full opacity
    const GLOW_BLUR = 15 // Soft glow effect

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push(new Particle(canvas, MIN_SPEED, MAX_SPEED, MIN_SIZE, MAX_SIZE, MAX_OPACITY))
      }
    }
    initParticles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(particle => {
        particle.update(canvas)
        particle.draw(ctx, GLOW_BLUR)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      setCanvasSize()
      initParticles() // Reinitialize to distribute evenly
    }

    window.addEventListener('resize', handleResize)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
