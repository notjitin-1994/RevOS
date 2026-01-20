import { LoginForm } from '@/components/auth/login-form'
import { SystemDiagnosticPanel } from '@/components/auth/system-diagnostic-panel'

/**
 * Login page - Split Layout
 *
 * Features:
 * - Split layout: Login card (left) + System diagnostic panel (right)
 * - Fullscreen background image with subtle blur
 * - Mobile responsive (stacks on mobile, side-by-side on desktop)
 * - Safe area support for iPhone Home bar
 *
 * Design System: Digital Volt
 * - Background: Fullscreen blurred image
 * - Philosophy: Industrial precision with digital elegance
 *
 * Layout Strategy:
 * - Desktop (lg+): Two-column grid (1fr | 400px fixed)
 * - Mobile (< lg): Stacked vertical layout
 */
export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background image with subtle blur */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/login-bg.jpg')",
          filter: 'blur(10px)',
          transform: 'scale(1.02)',
        }}
      />
      {/* Graphite overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: 'rgba(31, 41, 55, 0.4)',
        }}
      />

      {/* Split Layout Container */}
      <div className="relative z-10 min-h-screen lg:grid lg:grid-cols-2 lg:divide-x lg:divide-graphite-700">
        {/* Left Column: Login Form */}
        <div className="flex flex-col items-center justify-center px-4 py-12 lg:py-0 lg:p-4 lg:py-0 pb-safe">
          <LoginForm />
        </div>

        {/* Right Column: System Diagnostic Panel (Desktop) */}
        <div className="hidden lg:block">
          <SystemDiagnosticPanel />
        </div>
      </div>
    </main>
  )
}
