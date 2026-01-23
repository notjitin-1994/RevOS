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

      {/* Mobile Footer - Only visible on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20">
        {/* Gradient fade above footer */}
        <div className="h-8 bg-gradient-to-t from-graphite-900/80 to-transparent pointer-events-none" />

        {/* Footer content */}
        <div className="relative px-4 py-4 bg-graphite-900/80 backdrop-blur-lg border-t border-[#CCFF00]/10">
          <div className="max-w-[462px] mx-auto">
            {/* Links */}
            <nav className="flex items-center justify-center gap-6 mb-3" aria-label="Footer navigation">
              <a
                href="/pricing"
                className="relative group text-xs font-medium text-white/60 hover:text-[#CCFF00] transition-all duration-200 py-1"
              >
                <span className="relative z-10">Pricing</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#CCFF00] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
              </a>

              <span className="text-white/20">|</span>

              <a
                href="/terms"
                className="relative group text-xs font-medium text-white/60 hover:text-[#CCFF00] transition-all duration-200 py-1"
              >
                <span className="relative z-10">Terms</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#CCFF00] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
              </a>

              <span className="text-white/20">|</span>

              <a
                href="/privacy"
                className="relative group text-xs font-medium text-white/60 hover:text-[#CCFF00] transition-all duration-200 py-1"
              >
                <span className="relative z-10">Privacy</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#CCFF00] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
              </a>
            </nav>

            {/* Bottom row */}
            <div className="flex items-center justify-center gap-2 text-xs text-white/60">
              <span className="text-white/70">© 2026 </span>
              <span className="text-lime-400 font-semibold">RevvOS</span>
              <span className="text-white/50">|</span>
              <span className="font-display font-semibold tracking-wide text-white/70">
                POWERED BY{' '}
                <span className="font-manrope">
                  <span className="font-bold text-[#FF4F00]">GLITCH</span>
                  <span className="font-normal text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]">ZERO</span>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-safe pb-safe bg-graphite-900/80 backdrop-blur-lg" />
      </div>
    </main>
  )
}
