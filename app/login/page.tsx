import { LoginForm } from '@/components/auth/login-form'
import { SystemDiagnosticPanel } from '@/components/auth/system-diagnostic-panel'
import { GlowingDots } from '@/components/ui/glowing-dots'

/**
 * Login page - Split Layout
 *
 * Features:
 * - Split layout: Login card (left) + System diagnostic panel (right)
 * - Light gray background (#CFD0D4)
 * - Mobile responsive (stacks on mobile, side-by-side on desktop)
 * - Safe area support for iPhone Home bar
 * - Subtle glowing dots background animation
 *
 * Design System: Digital Volt
 * - Background: Light Gray (#CFD0D4)
 * - Animation: 0F172A glowing dots
 * - Philosophy: Industrial precision with digital elegance
 *
 * Layout Strategy:
 * - Desktop (lg+): Two-column grid (1fr | 400px fixed)
 * - Mobile (< lg): Stacked vertical layout
 */
export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#CFD0D4' }}>
      {/* Background animation layer */}
      <div className="absolute inset-0 z-0">
        <GlowingDots />
      </div>

      {/* Split Layout Container */}
      <div className="relative z-10 min-h-screen lg:grid lg:grid-cols-2 lg:divide-x lg:divide-graphite-700">
        {/* Left Column: Login Form */}
        <div className="flex flex-col items-center justify-center p-4 py-12 lg:py-0 pb-safe">
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
