// app/components/PinEntry.tsx
'use client'
import { useState } from 'react'
import { usePin } from '../context/PinContext'
import { Spinner } from './Spinner'

export function PinEntry() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { authenticate } = usePin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate a small delay for security
    await new Promise(resolve => setTimeout(resolve, 500))

    if (authenticate(pin)) {
      setPin('')
    } else {
      setError('Incorrect PIN')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-baby-light p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-baby-accent text-center mb-8">
          Baby Tracker
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/[^0-9]/g, ''))
                setError('')
              }}
              className="w-full text-center text-3xl tracking-widest p-4 border border-baby-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
              placeholder="••••"
              required
            />
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || pin.length !== 4}
            className="w-full bg-baby-accent text-white py-3 rounded-xl hover:bg-baby-soft transition-colors duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading && <Spinner />}
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}