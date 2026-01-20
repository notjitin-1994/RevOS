/**
 * Login logo/brand header component - RevvOs Branding
 *
 * Displays the RevvOs branding with simple "R" logo
 */
export function LoginLogo() {
  return (
    <div className="text-center">
      {/* Logo Container */}
      <div className="inline-flex items-center justify-center mb-6">
        <div className="h-[90px] w-[90px] shrink-0 rounded-lg bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center shadow-lg shadow-brand/20">
          <span className="text-graphite-900 font-bold text-[56px]">R</span>
        </div>
      </div>

      {/* Product Name */}
      <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-2">
        RevvOs
      </h1>

      {/* Tagline */}
      <p className="text-base font-display font-semibold text-brand tracking-wide">
        Garage Management System
      </p>
    </div>
  )
}
