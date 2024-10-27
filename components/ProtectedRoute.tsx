// app/components/ProtectedRoute.tsx
'use client'
import { usePin } from '../context/PinContext'
import { PinEntry } from './PinEntry'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = usePin()

  if (!isAuthenticated) {
    return <PinEntry />
  }

  return children
}