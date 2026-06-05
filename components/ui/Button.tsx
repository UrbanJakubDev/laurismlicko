'use client'

import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-accent-primary text-white hover:brightness-110 active:brightness-95 shadow-sm shadow-accent-primary/20',
  secondary:
    'bg-bg-elevated text-text-primary hover:bg-bg-card active:bg-bg-elevated',
  danger:
    'bg-accent-danger text-white hover:brightness-110 active:brightness-95 shadow-sm shadow-accent-danger/20',
  ghost:
    'bg-transparent text-text-secondary hover:bg-bg-elevated active:bg-bg-elevated/80',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-base px-6 py-3 rounded-xl',
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-150
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  )
}
