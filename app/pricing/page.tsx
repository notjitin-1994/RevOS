'use client'

import { Check, X, Sparkles, Zap, Shield, HeadphonesIcon, Rocket, TrendingUp, Users, Building2, ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

/**
 * Pricing Page
 *
 * Features:
 * - 3-tier pricing display (Essential, Professional, Enterprise + AI)
 * - Toggle between monthly and annual billing
 * - Feature comparison matrix
 * - Mobile responsive with horizontal scrollable cards and tabbed interface
 * - Call-to-action buttons
 * - Expandable feature lists (hover/click to reveal all features)
 *
 * Design System: Digital Volt
 * - Background: Dark theme with brand accent
 * - Philosophy: Premium positioning with clear value communication
 */

export default function PricingPage() {
  const tiers = ['Core', 'Pro', 'Max']
  const [activeTier, setActiveTier] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to active tier when tab is clicked
  const scrollToTier = (index: number) => {
    setActiveTier(index)
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      })
    }
  }

  // Update active tier on scroll
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.offsetWidth
      const scrollLeft = scrollContainerRef.current.scrollLeft
      const newActiveTier = Math.round(scrollLeft / cardWidth)
      setActiveTier(newActiveTier)
    }
  }
  return (
    <main className="min-h-screen bg-graphite-900 text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-32">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/login" className="text-white/60 hover:text-brand transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-white/20">/</li>
              <li className="text-brand font-medium">Pricing</li>
            </ol>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 mb-6">
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="text-sm font-medium text-brand">Simple, Transparent Pricing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
              Choose the Perfect Plan
              <span className="block text-brand mt-2">For Your Garage</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Streamline your motorcycle garage operations with India's most comprehensive
              workshop management platform. Start with a 21-day free trial.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand" />
                <span>21-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Mobile Tabbed Interface */}
        <div className="lg:hidden mb-6">
          <div className="flex justify-center gap-2 p-1 bg-graphite-800 rounded-xl">
            {tiers.map((tier, index) => (
              <button
                key={tier}
                onClick={() => scrollToTier(index)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTier === index
                    ? 'bg-brand text-graphite-900 shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="lg:hidden">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex-shrink-0 w-full snap-center">
              <PricingCard
                name="Core"
                description="Perfect for small garages with 1-3 service bays"
                monthlyPrice={5999}
                annualPrice={53990}
                features={{
                  included: [
                    'Up to 3 user seats',
                    '1 Location',
                    'Up to 200 customers',
                    'Up to 200 vehicles',
                    'Job Card Management (Kanban view)',
                    'Customer Management (CRM)',
                    'Vehicle Registry & History',
                    'Basic Inventory Management',
                    'GST Invoicing & Billing',
                    'Quote/Estimate Generation',
                    'Basic Dashboard',
                    'Calendar View',
                    'Service Reminders (manual)',
                    '10 Pre-built Reports',
                    'Mobile App Access',
                    'Email Support (48-hour response)',
                  ],
                  excluded: [
                    'Gantt Timeline view',
                    'Analytics Dashboard',
                    'Multi-location support',
                    'Integrations',
                    'API Access',
                    'AI Features',
                    'Customer Portal',
                    'Advanced Reports',
                    'Time Tracking',
                  ],
                }}
                cta="Start Free Trial"
                badge={null}
              />
            </div>

            <div className="flex-shrink-0 w-full snap-center">
              <PricingCard
                name="Pro"
                description="For growing garages with 3-6 service bays"
                monthlyPrice={9999}
                annualPrice={89990}
                features={{
                  included: [
                    'Up to 8 user seats (expandable to 12)',
                    'Up to 2 locations',
                    'Everything in Essential',
                    'All 4 Job Card Views (Kanban, Gantt, Calendar, Analytics)',
                    'Advanced Kanban (swimlanes, drag-drop, zoom)',
                    'Time Tracking per Task',
                    'Mechanic Performance Reports',
                    'Advanced Analytics Dashboard',
                    'Job Completion Rates',
                    'Average Cycle Time Analysis',
                    'Mechanic Productivity Tracking',
                    'Revenue by Job Status',
                    'Trend Analysis',
                    'Employee Management (unlimited)',
                    'Multi-Location Support (2 locations)',
                    'Purchase Order Management',
                    'Supplier/Vendor Management',
                    'Customer Portal (self-service)',
                    'Advanced Inventory (warehouse + on-hand)',
                    'Accounting Integration (Tally, Zoho Books)',
                    'Payment Gateway Integration (Razorpay, Stripe)',
                    'WhatsApp Business API',
                    '50+ Pre-built Reports',
                    'Priority Email Support (24-hour)',
                    'Phone Support (business hours)',
                    'Onboarding Specialist',
                  ],
                  excluded: [
                    'AI Features',
                    'Unlimited locations',
                    'API Access',
                    'White-label App',
                    'Custom Integrations',
                    '24/7 Support',
                  ],
                }}
                cta="Start Free Trial"
                badge={{
                  text: 'RECOMMENDED',
                  color: 'bg-brand',
                  textColor: 'text-graphite-900',
                }}
              />
            </div>

            <div className="flex-shrink-0 w-full snap-center">
              <PricingCard
                name="Max"
                description="For multi-location garages and dealerships"
                monthlyPrice={17999}
                annualPrice={161990}
                features={{
                  included: [
                    'Unlimited user seats',
                    'Unlimited locations',
                    'Everything in Professional',
                    '🧠 Predictive Maintenance Alerts',
                    '🧠 Customer Churn Prediction',
                    '🧠 Demand Forecasting',
                    '🧠 AI Price Optimization',
                    '🧠 AI Service Recommendations',
                    '🧠 Intelligent Scheduling Optimization',
                    '🧠 Auto-Reorder Predictions',
                    '🧠 Customer Segmentation',
                    '🧠 Real-Time AI Performance Dashboard',
                    '🧠 Anomaly Detection (fraud, theft)',
                    '🧠 Customer Lifetime Value Prediction',
                    '🧠 Sentiment Analysis',
                    'Unlimited locations',
                    'Consolidated Multi-Location Reporting',
                    'API Access (unlimited)',
                    'Custom Integrations',
                    'White-Label Mobile App',
                    'Role-Based Access Control (granular)',
                    'Custom Workflow Automation',
                    'Dedicated Account Manager',
                    '24/7 Priority Support',
                    'Quarterly Business Reviews',
                    'Free Customization (40 hours/year)',
                  ],
                  excluded: [],
                }}
                cta="Contact Sales"
                badge={{
                  text: 'AI INCLUDED',
                  color: 'bg-gradient-to-r from-brand to-brand/70',
                  textColor: 'text-graphite-900',
                }}
                highlighted={true}
              />
            </div>
          </div>

          {/* Mobile Scroll Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {tiers.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToTier(index)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  activeTier === index ? 'w-8 bg-brand' : 'w-2 bg-white/30'
                }`}
                aria-label={`Go to ${tiers[index]} tier`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 lg:gap-6 items-start">
          {/* Tier 1: Core */}
          <PricingCard
            name="Core"
            description="Perfect for small garages with 1-3 service bays"
            monthlyPrice={5999}
            annualPrice={53990}
            features={{
              included: [
                'Up to 3 user seats',
                '1 Location',
                'Up to 200 customers',
                'Up to 200 vehicles',
                'Job Card Management (Kanban view)',
                'Customer Management (CRM)',
                'Vehicle Registry & History',
                'Basic Inventory Management',
                'GST Invoicing & Billing',
                'Quote/Estimate Generation',
                'Basic Dashboard',
                'Calendar View',
                'Service Reminders (manual)',
                '10 Pre-built Reports',
                'Mobile App Access',
                'Email Support (48-hour response)',
              ],
              excluded: [
                'Gantt Timeline view',
                'Analytics Dashboard',
                'Multi-location support',
                'Integrations',
                'API Access',
                'AI Features',
                'Customer Portal',
                'Advanced Reports',
                'Time Tracking',
              ],
            }}
            cta="Start Free Trial"
            badge={null}
          />

          {/* Tier 2: Pro - Recommended */}
          <PricingCard
            name="Pro"
            description="For growing garages with 3-6 service bays"
            monthlyPrice={9999}
            annualPrice={89990}
            features={{
              included: [
                'Up to 8 user seats (expandable to 12)',
                'Up to 2 locations',
                'Everything in Essential',
                'All 4 Job Card Views (Kanban, Gantt, Calendar, Analytics)',
                'Advanced Kanban (swimlanes, drag-drop, zoom)',
                'Time Tracking per Task',
                'Mechanic Performance Reports',
                'Advanced Analytics Dashboard',
                'Job Completion Rates',
                'Average Cycle Time Analysis',
                'Mechanic Productivity Tracking',
                'Revenue by Job Status',
                'Trend Analysis',
                'Employee Management (unlimited)',
                'Multi-Location Support (2 locations)',
                'Purchase Order Management',
                'Supplier/Vendor Management',
                'Customer Portal (self-service)',
                'Advanced Inventory (warehouse + on-hand)',
                'Accounting Integration (Tally, Zoho Books)',
                'Payment Gateway Integration (Razorpay, Stripe)',
                'WhatsApp Business API',
                '50+ Pre-built Reports',
                'Priority Email Support (24-hour)',
                'Phone Support (business hours)',
                'Onboarding Specialist',
              ],
              excluded: [
                'AI Features',
                'Unlimited locations',
                'API Access',
                'White-label App',
                'Custom Integrations',
                '24/7 Support',
              ],
            }}
            cta="Start Free Trial"
            badge={{
              text: 'RECOMMENDED',
              color: 'bg-brand',
              textColor: 'text-graphite-900',
            }}
          />

          {/* Tier 3: Max */}
          <PricingCard
            name="Max"
            description="For multi-location garages and dealerships"
            monthlyPrice={17999}
            annualPrice={161990}
            features={{
              included: [
                'Unlimited user seats',
                'Unlimited locations',
                'Everything in Professional',
                '🧠 Predictive Maintenance Alerts',
                '🧠 Customer Churn Prediction',
                '🧠 Demand Forecasting',
                '🧠 AI Price Optimization',
                '🧠 AI Service Recommendations',
                '🧠 Intelligent Scheduling Optimization',
                '🧠 Auto-Reorder Predictions',
                '🧠 Customer Segmentation',
                '🧠 Real-Time AI Performance Dashboard',
                '🧠 Anomaly Detection (fraud, theft)',
                '🧠 Customer Lifetime Value Prediction',
                '🧠 Sentiment Analysis',
                'Unlimited locations',
                'Consolidated Multi-Location Reporting',
                'API Access (unlimited)',
                'Custom Integrations',
                'White-Label Mobile App',
                'Role-Based Access Control (granular)',
                'Custom Workflow Automation',
                'Dedicated Account Manager',
                '24/7 Priority Support',
                'Quarterly Business Reviews',
                'Free Customization (40 hours/year)',
              ],
              excluded: [],
            }}
            cta="Contact Sales"
            badge={{
              text: 'AI INCLUDED',
              color: 'bg-gradient-to-r from-brand to-brand/70',
              textColor: 'text-graphite-900',
            }}
            highlighted={true}
          />
        </div>

        {/* Annual Savings Banner */}
        <div className="mt-12 bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/20 rounded-2xl p-8 text-center">
          <p className="text-lg font-medium text-white mb-2">
            Save <span className="text-brand font-bold">25%</span> with annual billing
          </p>
          <p className="text-white/60 text-sm">
            Annual plans include 2 months free and lower churn. Most garages choose annual billing.
          </p>
        </div>

        {/* Feature Comparison Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-graphite-700">
                  <th className="text-left py-4 px-4 text-white/60 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-white/60 font-medium">Core</th>
                  <th className="text-center py-4 px-4 text-white/60 font-medium">Pro</th>
                  <th className="text-center py-4 px-4 text-white/60 font-medium">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-700/50">
                <FeatureRow
                  name="User Seats"
                  essential="3 users"
                  professional="8-12 users"
                  enterprise="Unlimited"
                />
                <FeatureRow
                  name="Locations"
                  essential="1 location"
                  professional="2 locations"
                  enterprise="Unlimited"
                />
                <FeatureRow
                  name="Job Card Views"
                  essential="Kanban only"
                  professional="All 4 views"
                  enterprise="All 4 views + AI"
                  enterpriseHighlight
                />
                <FeatureRow
                  name="Analytics Dashboard"
                  essential={<Check className="w-5 h-5 text-status-error mx-auto" />}
                  professional={<Check className="w-5 h-5 text-brand mx-auto" />}
                  enterprise={<Check className="w-5 h-5 text-brand mx-auto" />}
                />
                <FeatureRow
                  name="AI Features"
                  essential={<Check className="w-5 h-5 text-status-error mx-auto" />}
                  professional={<Check className="w-5 h-5 text-status-error mx-auto" />}
                  enterprise={<Check className="w-5 h-5 text-brand mx-auto" />}
                  enterpriseHighlight
                />
                <FeatureRow
                  name="Multi-Location Support"
                  essential={<Check className="w-5 h-5 text-status-error mx-auto" />}
                  professional="2 locations"
                  enterprise="Unlimited"
                />
                <FeatureRow
                  name="Integrations"
                  essential="None"
                  professional="5 core integrations"
                  enterprise="Unlimited + custom"
                />
                <FeatureRow
                  name="API Access"
                  essential={<Check className="w-5 h-5 text-status-error mx-auto" />}
                  professional={<Check className="w-5 h-5 text-status-error mx-auto" />}
                  enterprise={<Check className="w-5 h-5 text-brand mx-auto" />}
                />
                <FeatureRow
                  name="Customer Portal"
                  essential={<Check className="w-5 h-5 text-status-error mx-auto" />}
                  professional={<Check className="w-5 h-5 text-brand mx-auto" />}
                  enterprise={<Check className="w-5 h-5 text-brand mx-auto" />}
                />
                <FeatureRow
                  name="Support"
                  essential="Email (48hr)"
                  professional="Priority + Phone"
                  enterprise="24/7 + Account Manager"
                  enterpriseHighlight
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-display font-bold text-center mb-4">
            Add-Ons & Extras
          </h2>
          <p className="text-center text-white/60 mb-12">
            Enhance your plan with these optional add-ons
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AddonCard
              icon={<Users className="w-6 h-6" />}
              name="Additional User Seat"
              price="₹999/user/month"
              description="Add more users to your Essential or Professional plan"
            />
            <AddonCard
              icon={<Building2 className="w-6 h-6" />}
              name="Additional Location"
              price="₹4,999/location/month"
              description="Add more locations to your Professional plan"
            />
            <AddonCard
              icon={<Sparkles className="w-6 h-6" />}
              name="AI Starter Pack"
              price="₹4,999/month"
              description="Limited AI features for Essential or Professional plans"
            />
            <AddonCard
              icon={<Zap className="w-6 h-6" />}
              name="White-Label Mobile App"
              price="₹9,999 setup + ₹2,999/month"
              description="Your branded mobile app for Essential or Professional"
            />
            <AddonCard
              icon={<Shield className="w-6 h-6" />}
              name="Custom Integration"
              price="₹49,999 one-time + ₹9,999/month"
              description="Build custom integrations with any software"
            />
            <AddonCard
              icon={<HeadphonesIcon className="w-6 h-6" />}
              name="Dedicated Onboarding"
              price="₹19,999 one-time"
              description="Personalized onboarding and training for your team"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <FAQItem
              question="How does the 21-day free trial work?"
              answer="Start with full access to Professional tier features. No credit card required. After 21 days, choose a plan that fits your needs. Your data is preserved when you upgrade."
            />
            <FAQItem
              question="Can I change plans later?"
              answer="Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the next billing cycle."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit/debit cards, UPI, net banking, and wallets (Paytm, PhonePe, Amazon Pay). For annual plans, we also accept bank transfers."
            />
            <FAQItem
              question="Do you offer discounts for multi-year commitments?"
              answer="Yes! Contact our sales team for special pricing on 2-year and 3-year commitments. Multi-year plans offer additional savings up to 35%."
            />
            <FAQItem
              question="Is there a setup fee?"
              answer="No setup fee for any plan. We provide free onboarding and training to get you started. Premium onboarding packages are available for enterprises that need dedicated support."
            />
            <FAQItem
              question="What is your refund policy?"
              answer="We offer a 30-day money-back guarantee. If you're not satisfied within the first 30 days of your paid subscription, we'll provide a full refund, no questions asked."
            />
            <FAQItem
              question="How do AI features work?"
              answer="AI features in the Enterprise plan use machine learning to analyze your garage data and provide intelligent insights. This includes predictive maintenance, demand forecasting, price optimization, and more. AI requires at least 3 months of data to provide accurate predictions."
            />
            <FAQItem
              question="Can I import my existing data?"
              answer="Yes! We provide free data migration assistance to help you import customers, vehicles, inventory, and job cards from spreadsheets or other software. Enterprise plans include dedicated migration support."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-brand/10 via-brand/5 to-brand/10 border border-brand/20 rounded-3xl p-12 max-w-4xl mx-auto">
            <Rocket className="w-16 h-16 text-brand mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Ready to Transform Your Garage?
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              Join 500+ garages across India using RevvOS to streamline operations,
              increase revenue, and deliver exceptional customer service.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand hover:bg-brand-hover text-graphite-900 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 hover:border-brand text-white font-medium rounded-lg transition-all duration-200"
              >
                Contact Sales
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-white/60 text-sm mb-4">Trusted by leading garages across India</p>
              <div className="flex flex-wrap items-center justify-center gap-8 text-white/40">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand" />
                  <span className="text-sm">23% avg. revenue increase</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand" />
                  <span className="text-sm">30% faster job completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand" />
                  <span className="text-sm">500+ garages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-graphite-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-white/60">
              <span className="text-white/70">© 2026 </span>
              <span className="text-lime-400 font-semibold">RevvOS</span>
              <span className="text-white/50 mx-2">|</span>
              <span className="font-display font-semibold tracking-wide text-white/70">
                POWERED BY{' '}
                <span className="font-manrope">
                  <span className="font-bold text-[#FF4F00]">GLITCH</span>
                  <span className="font-normal text-white">ZERO</span>
                </span>
              </span>
            </div>

            <nav className="flex items-center gap-6 text-sm" aria-label="Footer navigation">
              <Link href="/login" className="text-white/60 hover:text-brand transition-colors">
                Home
              </Link>
              <Link href="/terms" className="text-white/60 hover:text-brand transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-white/60 hover:text-brand transition-colors">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  )
}

// Pricing Card Component
function PricingCard({
  name,
  description,
  monthlyPrice,
  annualPrice,
  features,
  cta,
  badge,
  highlighted = false,
}: {
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  features: { included: string[]; excluded: string[] }
  cta: string
  badge: { text: string; color: string; textColor: string } | null
  highlighted?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={`relative rounded-2xl p-8 transition-all duration-300 ${
        highlighted
          ? 'bg-gradient-to-b from-brand/20 to-brand/5 border-2 border-brand shadow-glow'
          : 'bg-graphite-800 border border-graphite-700 hover:border-brand/50'
      }`}
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold ${badge.color} ${badge.textColor}`}>
          {badge.text}
        </div>
      )}

      {/* Header */}
      <div className="pt-4">
        <h3 className="text-2xl font-bold font-display mb-2">{name}</h3>
        <p className="text-white/60 text-sm mb-6">{description}</p>

        {/* Pricing */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">₹{monthlyPrice.toLocaleString('en-IN')}</span>
            <span className="text-white/60">/month</span>
          </div>
          <p className="text-white/60 text-sm mt-1">
            or <span className="text-brand font-semibold">₹{annualPrice.toLocaleString('en-IN')}/year</span>
            <span className="text-xs ml-1">(save 25%)</span>
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href="/login"
          className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            highlighted
              ? 'bg-brand hover:bg-brand-hover text-graphite-900'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {cta}
        </Link>
      </div>

      {/* Features List */}
      <div className="mt-8 space-y-4">
        <p className="text-sm font-semibold text-white/80">What's included:</p>

        <div className="space-y-3">
          {/* Always show first 8 features */}
          {features.included.slice(0, 8).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <span className="text-sm text-white/80">{feature}</span>
            </div>
          ))}

          {/* Expandable section for additional features */}
          {features.included.length > 8 && (
            <>
              {/* Hidden features container */}
              <div
                className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                  isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-3">
                  {features.included.slice(8).map((feature, idx) => (
                    <div key={`more-${idx}`} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                      <span className="text-sm text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expand/collapse button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-brand hover:text-brand/90 transition-colors pl-8 mt-2 cursor-pointer group"
              >
                <span>
                  {isExpanded ? 'Show less' : `+${features.included.length - 8} more features...`}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </>
          )}
        </div>

        {/* Excluded features section */}
        {features.excluded.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm font-semibold text-white/80 mb-3">Not included:</p>
            <div className="space-y-2">
              {/* Always show first 3 excluded features */}
              {features.excluded.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-white/30 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/40">{feature}</span>
                </div>
              ))}

              {/* Expandable section for additional excluded features */}
              {features.excluded.length > 3 && (
                <>
                  {/* Hidden excluded features */}
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="space-y-2">
                      {features.excluded.slice(3).map((feature, idx) => (
                        <div key={`excluded-more-${idx}`} className="flex items-start gap-3">
                          <X className="w-5 h-5 text-white/30 shrink-0 mt-0.5" />
                          <span className="text-sm text-white/40">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Show more excluded button if not already showing expand button */}
                  {features.included.length <= 8 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors pl-8 mt-2 cursor-pointer"
                    >
                      <span>
                        +{features.excluded.length - 3} more not included
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Feature Row Component
function FeatureRow({
  name,
  essential,
  professional,
  enterprise,
  enterpriseHighlight = false,
}: {
  name: string
  essential: React.ReactNode
  professional: React.ReactNode
  enterprise: React.ReactNode
  enterpriseHighlight?: boolean
}) {
  return (
    <tr className={`hover:bg-white/5 ${enterpriseHighlight ? 'bg-brand/5' : ''}`}>
      <td className="py-4 px-4 font-medium text-white">{name}</td>
      <td className="text-center py-4 px-4 text-white/70">{essential}</td>
      <td className="text-center py-4 px-4 text-white/70">{professional}</td>
      <td className={`text-center py-4 px-4 ${enterpriseHighlight ? 'text-brand font-semibold' : 'text-white/70'}`}>
        {enterprise}
      </td>
    </tr>
  )
}

// Add-on Card Component
function AddonCard({
  icon,
  name,
  price,
  description,
}: {
  icon: React.ReactNode
  name: string
  price: string
  description: string
}) {
  return (
    <div className="bg-graphite-800 border border-graphite-700 rounded-xl p-6 hover:border-brand/50 transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-brand/10 rounded-lg text-brand">{icon}</div>
        <h3 className="font-semibold text-white">{name}</h3>
      </div>
      <p className="text-2xl font-bold text-brand mb-2">{price}</p>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-graphite-800 border border-graphite-700 rounded-xl p-6">
      <h3 className="font-semibold text-white mb-2">{question}</h3>
      <p className="text-sm text-white/60">{answer}</p>
    </div>
  )
}
