// app/components/Navigation.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { usePin } from '@/context/PinContext'
import { useState, useEffect } from 'react'

export function Navigation() {
  const { logout } = usePin()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close the menu when the pathname changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // If we're on the homepage or PIN entry, don't show navigation
  if (pathname === '/' ) {
    return null
  }

  // Extract babyId from pathname

  // Hardcoded babyId for now
  // TODO: Remove this
  const babyId = 3

  const ToggleButton = () => (
    <div className="fixed bottom-6 right-6 bg-white rounded-full shadow-lg p-3 backdrop-blur-sm z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="text-baby-accent">
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        )}
      </button>
    </div>
  )

  // Render navigation content
  const navigationContent = isOpen && (
    <div className="fixed inset-x-4 bottom-16 h-[45%] bg-white shadow-xl p-6 backdrop-blur-sm z-50 rounded-3xl">
      <nav className="flex flex-col gap-6 items-center">
        <Link
          href={`/babies/${babyId}`}
          className={`text-xl text-baby-accent hover:text-baby-soft transition-colors font-medium ${
            pathname === `/babies/${babyId}` ? 'text-baby-soft' : ''
          }`}
        >
          Přehled
        </Link>
        <Link
          href={`/babies/${babyId}/measurements`}
          className={`text-xl text-baby-accent hover:text-baby-soft transition-colors font-medium ${
            pathname === `/babies/${babyId}/measurements` ? 'text-baby-soft' : ''
          }`}
        >
          Měření
        </Link>
        <Link
          href={`/foods`}
          className={`text-xl text-baby-accent hover:text-baby-soft transition-colors font-medium ${
            pathname === `/foods` ? 'text-baby-soft' : ''
          }`}
        >
          Seznam jídel
        </Link>
        <Link
          href={`/units`}
          className={`text-xl text-baby-accent hover:text-baby-soft transition-colors font-medium ${
            pathname === `/units` ? 'text-baby-soft' : ''
          }`}
        >
          Jednotky
        </Link>

        <button
          onClick={logout}
          className="text-xl text-baby-accent hover:text-baby-soft transition-colors font-medium"
        >
          Lock
        </button>
      </nav>
    </div>
  )

  return (
    <>
      {navigationContent}
      <ToggleButton />
    </>
  )
}