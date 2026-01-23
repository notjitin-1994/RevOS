import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RevvOS - Add Customer',
  description: 'Add a new customer to your garage',
}

export default function AddCustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
