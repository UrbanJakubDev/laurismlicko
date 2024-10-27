// app/context/PinContext.tsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type PinContextType = {
  isAuthenticated: boolean
  authenticate: (pin: string) => boolean
  logout: () => void
}

const PinContext = createContext<PinContextType | null>(null)

export function PinProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check localStorage on initial load
  useEffect(() => {
    const auth = localStorage.getItem('pin-auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const authenticate = (pin: string) => {
    if (pin === process.env.NEXT_PUBLIC_APP_PIN) {
      setIsAuthenticated(true)
      localStorage.setItem('pin-auth', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('pin-auth')
  }

  return (
    <PinContext.Provider value={{ isAuthenticated, authenticate, logout }}>
      {children}
    </PinContext.Provider>
  )
}

export function usePin() {
  const context = useContext(PinContext)
  if (!context) {
    throw new Error('usePin must be used within a PinProvider')
  }
  return context
}