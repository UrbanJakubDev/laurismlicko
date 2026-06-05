'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'glass'
}

const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-bg-card shadow-sm border border-bg-elevated',
  elevated: 'bg-bg-elevated shadow-md',
  glass: 'glass shadow-sm',
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  return (
    <motion.div
      initial={{ scale: 0.97, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`rounded-2xl p-4 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.div>
  )
}
