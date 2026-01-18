import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { MotorcycleIcon } from '@/components/ui/motorcycle-icon'
import { getMakeBySlug } from '@/lib/supabase/motorcycle-queries'
import { ServiceScopeDetailClient } from '../components/service-scope-detail-client'

/**
 * Service Scope Detail Page
 *
 * Shows details of a motorcycle manufacturer (make) and all its models.
 * This is master data for the service scope.
 */

interface PageProps {
  params: {
    id: string
  }
}

export default async function ServiceScopeDetailPage({ params }: PageProps) {
  // Fetch data from database on server
  const make = await getMakeBySlug(params.id)

  if (!make) {
    notFound()
  }

  return <ServiceScopeDetailClient make={make} />
}
