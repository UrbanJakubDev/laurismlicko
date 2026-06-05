'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaHouse, FaBottleWater, FaRuler, FaGear } from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import { useBaby } from '../providers/BabyProvider'

interface Tab {
  label: string
  href: string
  icon: IconType
}

export function TabBar() {
  const pathname = usePathname()
  const { selectedBabyId } = useBaby()

  // Hide on welcome/home route
  if (pathname === '/') return null

  // Hide if no baby is selected yet
  if (!selectedBabyId) return null

  const tabs: Tab[] = [
    {
      label: 'Přehled',
      href: `/babies/${selectedBabyId}`,
      icon: FaHouse,
    },
    {
      label: 'Krmení',
      href: `/babies/${selectedBabyId}/feedings`,
      icon: FaBottleWater,
    },
    {
      label: 'Měření',
      href: `/babies/${selectedBabyId}/measurements`,
      icon: FaRuler,
    },
    {
      label: 'Nastavení',
      href: `/babies/${selectedBabyId}/settings`,
      icon: FaGear,
    },
  ]

  const isActive = (href: string) => {
    if (href === `/babies/${selectedBabyId}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 h-14">
        {tabs.map((tab) => {
          const active = isActive(tab.href)
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center flex-1 py-1 gap-0.5"
            >
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 mx-2 rounded-xl bg-accent-primary/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`relative z-10 text-xl transition-colors duration-200 ${
                  active ? 'text-accent-primary' : 'text-text-muted'
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-medium transition-colors duration-200 ${
                  active ? 'text-accent-primary' : 'text-text-muted'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
