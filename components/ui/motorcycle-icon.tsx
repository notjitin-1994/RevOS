/**
 * Motorcycle Icon - Lucide style
 * Sourced from https://lucide.dev/icons/motorbike
 */
export function MotorcycleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="17" cy="17" r="4" />
      <circle cx="5" cy="17" r="4" />
      <path d="M9 17h8" />
      <path d="M10.5 13.5L17 17" />
      <path d="M10.5 13.5a2.5 2.5 0 0 0-4.044.344" />
      <path d="M11.5 13.5L8 7" />
      <path d="M12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5" />
      <path d="M16.5 13.5L19 11" />
      <path d="M19 11l2-2" />
    </svg>
  )
}
