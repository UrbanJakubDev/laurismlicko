// app/context/PinContext.tsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type PinContextType = {
  isAuthenticated: boolean
  authenticate: (pin: string) => Promise<boolean>
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

  const authenticate = async (pin: string) => {
    try {
      const response = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(true)
        localStorage.setItem('pin-auth', 'true')
        return true
      }
      return false
    } catch (error) {
      console.error('PIN authentication error:', error)
      return false
    }
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