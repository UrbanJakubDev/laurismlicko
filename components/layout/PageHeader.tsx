'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaChevronLeft } from 'react-icons/fa6'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
}

export function PageHeader({ title, subtitle, backHref }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-40 glass-heavy"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="px-4 pb-2 pt-3">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-accent-primary text-sm font-medium mb-1 active:opacity-60 transition-opacity"
          >
            <FaChevronLeft className="text-xs" />
            <span>Zpět</span>
          </Link>
        )}

        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Bottom border line */}
      <div className="h-px bg-gradient-to-r from-transparent via-bg-elevated to-transparent" />
    </motion.header>
  )
}
