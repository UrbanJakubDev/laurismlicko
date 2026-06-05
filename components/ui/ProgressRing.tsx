'use client'

import { motion } from 'framer-motion'
import { useId } from 'react'

interface ProgressRingProps {
  progress: number // 0–100
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
}: ProgressRingProps) {
  const gradientId = useId()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const offset = circumference - (clampedProgress / 100) * circumference
  const center = size / 2

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-secondary)" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-text-primary">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      </div>

      {label && (
        <span className="text-sm font-medium text-text-primary">{label}</span>
      )}
      {sublabel && (
        <span className="text-xs text-text-muted">{sublabel}</span>
      )}
    </div>
  )
}
