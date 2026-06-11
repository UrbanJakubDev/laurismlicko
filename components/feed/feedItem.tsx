import { useState } from 'react'
import { formatOutputTime } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { Card } from '../ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTrash, FaPen } from 'react-icons/fa6'
import { format } from 'date-fns'

interface FeedItemProps {
  feed: {
    id: number
    createdAt: string
    updatedAt: string
    babyId: number
    feedTime: string
    amount: number
    type: string
    foodId: number
    food: {
      name: string
      emoji: string
      unit: {
        name: string
        emoji: string
      }
    }
    timeSinceLastFeed: string
  }
}

export default function FeedItem({ feed }: FeedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editFeedTime, setEditFeedTime] = useState('')
  const [editAmount, setEditAmount] = useState(feed.amount)
  const [editType, setEditType] = useState(feed.type)
  const [editFoodId, setEditFoodId] = useState(feed.foodId)

  const utils = trpc.useUtils()

  const { data: foods } = trpc.food.list.useQuery(undefined, {
    enabled: isEditing,
  })

  const deleteFeed = trpc.feed.delete.useMutation({
    onSuccess: () => {
      utils.feed.getStats.invalidate()
      utils.baby.getById.invalidate()
    }
  })

  const updateFeed = trpc.feed.update.useMutation({
    onSuccess: () => {
      utils.feed.getStats.invalidate()
      utils.baby.getById.invalidate()
      setIsEditing(false)
      setIsExpanded(false)
    }
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Opravdu smazat toto krmení?')) return
    deleteFeed.mutate({ id: feed.id })
  }

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditFeedTime(format(new Date(feed.feedTime), "yyyy-MM-dd'T'HH:mm"))
    setEditAmount(feed.amount)
    setEditType(feed.type)
    setEditFoodId(feed.foodId)
    setIsEditing(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateFeed.mutate({
      id: feed.id,
      feedTime: new Date(editFeedTime).toISOString(),
      amount: Number(editAmount),
      type: editType as 'main' | 'additional',
      foodId: Number(editFoodId),
    })
  }

  // Sort foods: milk (id: 4) first
  const sortedFoods = foods ? [...foods].sort((a, b) => {
    if (a.id === 4) return -1
    if (b.id === 4) return 1
    return 0
  }) : []

  const isMain = feed.type === 'main'

  return (
    <Card 
      variant={isMain ? 'elevated' : 'flat'}
      className={`mb-3 overflow-hidden cursor-pointer transition-colors ${
        !isMain ? 'bg-bg-elevated' : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <p className="text-lg font-bold text-text-primary">
              <span className="mr-2 text-xl">{feed.food?.emoji}</span>
              {feed.food?.name || 'N/A'}
            </p>
            <p className={`text-sm font-semibold ${isMain ? 'text-accent-primary' : 'text-text-secondary'}`}>
              {formatOutputTime(new Date(feed.feedTime))}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-lg font-bold text-text-primary">
              <span className="text-text-muted text-sm mr-1">{feed.food?.unit?.emoji}</span> 
              {feed.amount} <span className="text-sm font-medium text-text-secondary">{feed.food?.unit?.name || 'ml'}</span>
            </p>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
              {isMain ? 'Hlavní' : 'Doplňkové'}
            </p>
          </div>
        </div>

        {feed.timeSinceLastFeed && (
          <p className="text-xs font-medium text-text-muted text-right mt-2">
            od posl. krmení: {feed.timeSinceLastFeed}
          </p>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-bg-elevated/50"
            onClick={(e) => e.stopPropagation()}
          >
            {isEditing ? (
              <form onSubmit={handleUpdate} className="p-4 space-y-4 cursor-default">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">Čas krmení</label>
                  <input
                    type="datetime-local"
                    required
                    value={editFeedTime}
                    onChange={(e) => setEditFeedTime(e.target.value)}
                    className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="space-y-1.5 flex-1">
                    <label className="block text-sm font-medium text-text-secondary">Množství</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editAmount}
                      onChange={(e) => setEditAmount(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label className="block text-sm font-medium text-text-secondary">Jídlo</label>
                    <select
                      required
                      value={editFoodId}
                      onChange={(e) => setEditFoodId(Number(e.target.value))}
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

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">Typ</label>
                  <select
                    required
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
                  >
                    <option value="main">Hlavní chod</option>
                    <option value="additional">Doplněk</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={updateFeed.isPending}
                    className="px-4 py-2 bg-bg-elevated text-text-secondary rounded-lg text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    disabled={updateFeed.isPending}
                    className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {updateFeed.isPending ? 'Ukládám...' : 'Uložit změny'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 flex justify-end gap-2 bg-error/5">
                <button
                  onClick={startEditing}
                  className="flex items-center gap-2 px-4 py-2 bg-bg-elevated text-text-primary rounded-lg text-sm font-bold active:scale-95 transition-transform"
                >
                  <FaPen />
                  Upravit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteFeed.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
                >
                  <FaTrash />
                  {deleteFeed.isPending ? 'Mažu...' : 'Smazat krmení'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
