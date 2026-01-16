/**
 * Login logo/brand header component - RevOS Branding
 *
 * Displays the RevOS branding with:
 * - Logo container with brand background and animated rotating gear icon
 * - RevOS product name (Display font)
 * - Tagline highlighting value proposition
 * - Welcome message for context
 */
export function LoginLogo() {
  return (
    <div className="text-center">
      {/* Logo Container */}
      <div className="inline-flex items-center justify-center mb-6">
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-brand blur-xl opacity-20 rounded-2xl" />

          {/* Logo */}
          <div className="relative h-16 w-16 rounded-2xl bg-brand flex items-center justify-center shadow-glow">
            {/* Animated Rotating Detailed Gear Icon */}
            <svg
              className="w-10 h-10 text-graphite-900 animate-spin-slow"
              viewBox="0 0 100 100"
              fill="none"
              strokeWidth={3}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer gear ring with teeth */}
              <circle cx="50" cy="50" r="38" />

              {/* 12 gear teeth */}
              <path d="M50 6 L54 14 L46 14 Z" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(30 50 50)" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(60 50 50)" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(90 50 50)" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(120 50 50)" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(150 50 50)" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(180 50 50)" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(210 50 50)" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(240 50 50)" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(270 50 50)" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(300 50 50)" />
              <path d="M50 6 L54 14 L46 14 Z" transform="rotate(330 50 50)" />

              {/* Inner ring */}
              <circle cx="50" cy="50" r="26" />

              {/* Center hole */}
              <circle cx="50" cy="50" r="14" fill="currentColor" fillOpacity={0.1} />

              {/* 6 spoke details */}
              <path d="M50 24 L50 36" />
              <path d="M50 24 L50 36" transform="rotate(60 50 50)" />
              <path d="M50 24 L50 36" transform="rotate(120 50 50)" />
              <path d="M50 24 L50 36" transform="rotate(180 50 50)" />
              <path d="M50 24 L50 36" transform="rotate(240 50 50)" />
              <path d="M50 24 L50 36" transform="rotate(300 50 50)" />

              {/* Small detail circles between spokes */}
              <circle cx="50" cy="30" r="2" />
              <circle cx="50" cy="30" r="2" transform="rotate(60 50 50)" />
              <circle cx="50" cy="30" r="2" transform="rotate(120 50 50)" />
              <circle cx="50" cy="30" r="2" transform="rotate(180 50 50)" />
              <circle cx="50" cy="30" r="2" transform="rotate(240 50 50)" />
              <circle cx="50" cy="30" r="2" transform="rotate(300 50 50)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Product Name */}
      <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-2">
        RevOS
      </h1>

      {/* Tagline */}
      <p className="text-base font-display font-semibold text-brand tracking-wide">
        Garage Management System
      </p>
    </div>
  )
}
