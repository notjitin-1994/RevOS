import { notFound } from 'next/navigation'
import { getMakeBySlug } from '@/lib/supabase/motorcycle-queries'
import { AddModelClient } from './add-model-client'

/**
 * Add Model Page - Server Component
 *
 * Fetches make data server-side and passes to client component.
 */
interface PageProps {
  params: {
    id: string
  }
}

export default async function AddModelPage({ params }: PageProps) {
  const make = await getMakeBySlug(params.id)

  if (!make) {
    notFound()
  }

  return <AddModelClient make={make} />
}
