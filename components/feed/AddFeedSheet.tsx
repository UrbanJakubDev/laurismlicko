'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/trpc/client'
import { Button } from '../ui/Button'
import { SegmentedControl } from '../ui/SegmentedControl'
import { format } from 'date-fns'

import { getNotificationDelayMinutes } from '@/lib/utils'
import { NotificationModal } from './NotificationModal'
import { usePush } from '../providers/PushProvider'

interface AddFeedSheetProps {
  babyId: number
  averageAmount: number
  remainingAmount: number
  onSuccess?: () => void
}

export function AddFeedSheet({ babyId, averageAmount, remainingAmount, onSuccess }: AddFeedSheetProps) {
  const [feedTime, setFeedTime] = useState('')
  const [amount, setAmount] = useState(averageAmount > remainingAmount && remainingAmount > 0 ? remainingAmount : averageAmount)
  const [type, setType] = useState('main')
  const [foodId, setFoodId] = useState(4) // Default to standard milk id

  useEffect(() => {
    // Set default local time
    const now = new Date()
    setFeedTime(format(now, "yyyy-MM-dd'T'HH:mm"))
  }, [])

  const [showModal, setShowModal] = useState(false)
  const { isSubscribed, subscribe, subscription } = usePush()
  const scheduleNotification = trpc.feed.scheduleNotification.useMutation()

  const { data: foods } = trpc.food.list.useQuery()
  const utils = trpc.useUtils()
  
  const createFeed = trpc.feed.create.useMutation({
    onSuccess: async (_data, variables) => {
      utils.feed.getStats.invalidate()
      utils.baby.getById.invalidate()
      
      const pref = localStorage.getItem('notify-preference')
      if (pref === 'always_no') {
        if (onSuccess) onSuccess()
        return
      }

      if (pref === 'always_yes') {
        // Auto-schedule
        let sub = subscription
        if (!isSubscribed) {
          sub = await subscribe()
        }
        if (sub) {
          const hours = parseFloat(localStorage.getItem('notify-hours') || '2.5')
          scheduleNotification.mutate({
            subscription: sub,
            delayMinutes: getNotificationDelayMinutes(variables.feedTime, hours),
            title: '🍼 Čas na krmení!',
            message: `Uběhlo ${hours}h od posledního krmení. Je čas nakrmit miminko.`
          })
        }
        if (onSuccess) onSuccess()
        return
      }

      // If no preference, show modal
      setShowModal(true)
    }
  })

  // Sort foods: milk (id: 4) first
  const sortedFoods = foods ? [...foods].sort((a, b) => {
    if (a.id === 4) return -1
    if (b.id === 4) return 1
    return 0
  }) : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createFeed.mutate({
      babyId,
      feedTime: new Date(feedTime).toISOString(), // Convert to UTC string
      amount: Number(amount),
      type: type as 'main' | 'additional',
      foodId: Number(foodId)
    })
  }

  return (
    <div className="bg-bg-card rounded-2xl p-6 shadow-sm border border-bg-elevated">
      <h3 className="text-lg font-bold mb-4">Přidat krmení</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <SegmentedControl
          options={[
            { label: 'Hlavní chody', value: 'main' },
            { label: 'Doplňky', value: 'additional' }
          ]}
          value={type}
          onChange={setType}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">Čas krmení</label>
          <input
            type="datetime-local"
            required
            value={feedTime}
            onChange={(e) => setFeedTime(e.target.value)}
            className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
          />
        </div>

        <div className="flex gap-4">
          <div className="space-y-1.5 flex-1">
            <label className="block text-sm font-medium text-text-secondary">Množství (ml)</label>
            <input
              type="number"
              required
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
            />
          </div>

          <div className="space-y-1.5 flex-1">
            <label className="block text-sm font-medium text-text-secondary">Jídlo</label>
            <select
              required
              value={foodId}
              onChange={(e) => setFoodId(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
            >
              {sortedFoods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.emoji} {food.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-2"
          loading={createFeed.isPending}
        >
          Uložit krmení
        </Button>
      </form>

      <NotificationModal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false)
          if (onSuccess) onSuccess()
        }}
        onComplete={() => {
          // Additional logic if needed, but onClose is called anyway
        }}
        feedTime={feedTime}
        defaultHours={2.5}
      />
    </div>
  )
}
