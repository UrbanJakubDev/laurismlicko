'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { usePush } from '../providers/PushProvider'
import { trpc } from '@/trpc/client'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  defaultHours?: number
}

export function NotificationModal({ isOpen, onClose, onComplete, defaultHours = 2.5 }: NotificationModalProps) {
  const { isSupported, isSubscribed, subscribe, subscription } = usePush()
  const scheduleNotification = trpc.feed.scheduleNotification.useMutation()
  
  const [hours, setHours] = useState(defaultHours)

  const handleSchedule = async (always: boolean) => {
    if (!isSupported) {
      alert('Push notifikace nejsou na tomto zařízení podporovány. Přidejte si aplikaci na plochu (Add to Home Screen).')
      onClose()
      return
    }

    let sub = subscription
    if (!isSubscribed) {
      sub = await subscribe()
      if (!sub) {
        alert('Nepodařilo se aktivovat notifikace. Zkontrolujte oprávnění v prohlížeči.')
        onClose()
        return
      }
    }

    if (always) {
      localStorage.setItem('notify-preference', 'always_yes')
      localStorage.setItem('notify-hours', hours.toString())
    }

    // Schedule via QStash
    scheduleNotification.mutate({
      subscription: sub,
      delayMinutes: Math.round(hours * 60),
      title: '🍼 Čas na krmení!',
      message: `Uběhlo ${hours}h od posledního krmení. Je čas nakrmit miminko.`
    }, {
      onSuccess: () => {
        onComplete()
        onClose()
      }
    })
  }

  const handleNever = () => {
    localStorage.setItem('notify-preference', 'always_no')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm bg-bg-card rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ⏰
              </div>
              
              <h2 className="text-xl font-bold text-center text-text-primary mb-2">
                Upozornit na další krmení?
              </h2>
              <p className="text-center text-text-secondary mb-6 text-sm">
                Pošleme ti notifikaci, abyste na to nezapomněli.
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <button 
                  onClick={() => setHours(prev => Math.max(0.5, prev - 0.5))}
                  className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center text-xl font-bold active:scale-95 transition-transform"
                >
                  -
                </button>
                <div className="text-center w-20">
                  <span className="block text-3xl font-bold text-text-primary">{hours}</span>
                  <span className="text-xs text-text-muted uppercase font-bold tracking-wider">Hodin</span>
                </div>
                <button 
                  onClick={() => setHours(prev => Math.min(12, prev + 0.5))}
                  className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center text-xl font-bold active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  className="w-full text-base py-3.5"
                  onClick={() => handleSchedule(false)}
                  loading={scheduleNotification.isPending}
                >
                  Upozornit za {hours}h
                </Button>
                
                <Button 
                  variant="secondary" 
                  className="w-full text-base py-3.5"
                  onClick={() => handleSchedule(true)}
                  disabled={scheduleNotification.isPending}
                >
                  Upozorňovat takto pokaždé
                </Button>

                <div className="pt-2 flex gap-3">
                  <Button 
                    variant="ghost" 
                    className="flex-1 text-sm text-text-muted"
                    onClick={onClose}
                    disabled={scheduleNotification.isPending}
                  >
                    Nyní ne
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1 text-sm text-text-muted"
                    onClick={handleNever}
                    disabled={scheduleNotification.isPending}
                  >
                    Nikdy neupozorňovat
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
