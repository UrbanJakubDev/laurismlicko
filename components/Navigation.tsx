// app/components/Navigation.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { usePin } from '@/context/PinContext'

export function Navigation() {
  const { logout } = usePin()
  const pathname = usePathname()
  
  // If we're on the homepage or PIN entry, don't show navigation
  if (pathname === '/' || !pathname.startsWith('/babies/')) {
    return null
  }

  // Extract babyId from pathname
  const babyId = pathname.split('/')[2]

  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-baby-light rounded-full shadow-lg p-4 backdrop-blur-sm z-50">
      <div className="flex justify-around max-w-md mx-auto">
        <Link 
          href={`/babies/${babyId}`}
          className={`text-baby-accent hover:text-baby-soft transition-colors font-medium ${
            pathname === `/babies/${babyId}` ? 'text-baby-soft' : ''
          }`}
        >
          Dashboard
        </Link>
        <Link 
          href={`/babies/${babyId}/statistics`}
          className={`text-baby-accent hover:text-baby-soft transition-colors font-medium ${
            pathname === `/babies/${babyId}/statistics` ? 'text-baby-soft' : ''
          }`}
        >
          Statistics
        </Link>
        <button
          onClick={logout}
          className="text-baby-accent hover:text-baby-soft transition-colors font-medium"
        >
          Lock
        </button>
      </div>
    </nav>
  )
}