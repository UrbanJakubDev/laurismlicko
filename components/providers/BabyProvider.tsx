'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'selected-baby-id'

interface BabyContextValue {
  selectedBabyId: string | null
  setSelectedBabyId: (id: string) => void
}

const BabyContext = createContext<BabyContextValue | null>(null)

export function BabyProvider({ children }: { children: ReactNode }) {
  const [selectedBabyId, setSelectedBabyIdState] = useState<string | null>(null)

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSelectedBabyIdState(stored)
      }
    } catch {
      // localStorage may not be available (SSR, private browsing)
    }
  }, [])

  const setSelectedBabyId = useCallback((id: string) => {
    setSelectedBabyIdState(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, [])

  return (
    <BabyContext.Provider value={{ selectedBabyId, setSelectedBabyId }}>
      {children}
    </BabyContext.Provider>
  )
}

export function useBaby(): BabyContextValue {
  const context = useContext(BabyContext)
  if (!context) {
    throw new Error('useBaby musí být použit uvnitř <BabyProvider>')
  }
  return context
}
