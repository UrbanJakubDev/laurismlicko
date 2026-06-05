'use client'
import { useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { usePin } from '../context/PinContext'

export function PinEntry() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { authenticate } = usePin()
  const controls = useAnimation()

  const handlePress = async (num: string) => {
    if (isLoading || pin.length >= 4) return
    const newPin = pin + num
    setPin(newPin)
    setError(false)

    if (newPin.length === 4) {
      setIsLoading(true)
      const success = await authenticate(newPin)
      if (success) {
        setPin('')
      } else {
        setError(true)
        controls.start({
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.4 }
        })
        setTimeout(() => setPin(''), 500)
      }
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    if (isLoading) return
    setPin(prev => prev.slice(0, -1))
    setError(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full mx-auto pb-10">
        <div className="text-center mb-12">
          <div className="bg-accent-primary/10 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm">
            <span className="text-4xl">👶</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Ahoj, Míšo!</h1>
          <p className="text-text-secondary">Zadej PIN kód pro pokračování</p>
        </div>

        <motion.div 
          animate={controls}
          className="flex justify-center gap-6 mb-16"
        >
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                pin.length > index
                  ? 'bg-accent-primary scale-110'
                  : error 
                    ? 'bg-accent-danger' 
                    : 'bg-bg-elevated'
              }`}
            />
          ))}
        </motion.div>

        <div className="grid grid-cols-3 gap-y-6 gap-x-8 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="w-20 h-20 mx-auto rounded-full text-3xl font-medium text-text-primary bg-bg-card shadow-sm active:scale-95 active:bg-bg-elevated transition-all flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <div /> {/* Empty space for bottom-left */}
          <button
            onClick={() => handlePress('0')}
            className="w-20 h-20 mx-auto rounded-full text-3xl font-medium text-text-primary bg-bg-card shadow-sm active:scale-95 active:bg-bg-elevated transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-20 h-20 mx-auto rounded-full text-xl font-medium text-text-primary bg-transparent active:scale-95 transition-all flex items-center justify-center"
          >
            Smazat
          </button>
        </div>
      </div>
    </div>
  )
}