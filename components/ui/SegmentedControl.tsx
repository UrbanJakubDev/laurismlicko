'use client'

import { motion } from 'framer-motion'

interface SegmentOption {
  value: string
  label: string
}

interface SegmentedControlProps {
  options: SegmentOption[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="flex bg-bg-elevated rounded-xl p-1 gap-0.5">
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isActive ? 'text-text-primary' : 'text-text-secondary'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="segment-active"
                className="absolute inset-0 bg-bg-card rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
