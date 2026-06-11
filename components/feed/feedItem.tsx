import { useState } from 'react'
import type { FormEvent } from 'react'
import { format } from 'date-fns'
import { formatOutputTime } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { SegmentedControl } from '../ui/SegmentedControl'

interface FeedItemProps {
  feed: FeedListItem
}

export type FeedListItem = {
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
    emoji: string | null
    unit: {
      name: string
      emoji: string | null
    } | null
  }
  timeSinceLastFeed: string | null
}

export default function FeedItem({ feed }: FeedItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editFeedTime, setEditFeedTime] = useState(() =>
    format(new Date(feed.feedTime), "yyyy-MM-dd'T'HH:mm")
  )
  const [editAmount, setEditAmount] = useState(feed.amount)
  const [editType, setEditType] = useState(feed.type)
  const [editFoodId, setEditFoodId] = useState(feed.foodId)

  const utils = trpc.useUtils()
  const { data: foods } = trpc.food.list.useQuery()

  const resetEditForm = () => {
    setIsEditing(false)
    setEditFeedTime(format(new Date(feed.feedTime), "yyyy-MM-dd'T'HH:mm"))
    setEditAmount(feed.amount)
    setEditType(feed.type)
    setEditFoodId(feed.foodId)
  }

  const sortedFoods = foods
    ? [...foods].sort((a, b) => {
        if (a.id === 4) return -1
        if (b.id === 4) return 1
        return 0
      })
    : []
  
  const updateFeed = trpc.feed.update.useMutation({
    onSuccess: () => {
      void utils.feed.getStats.invalidate()
      void utils.baby.getById.invalidate({ id: feed.babyId })
      setIsEditing(false)
    }
  })

  const deleteFeed = trpc.feed.delete.useMutation({
    onSuccess: () => {
      void utils.feed.getStats.invalidate()
      void utils.baby.getById.invalidate({ id: feed.babyId })
    }
  })

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault()

    updateFeed.mutate({
      id: feed.id,
      feedTime: new Date(editFeedTime).toISOString(),
      amount: Number(editAmount),
      type: editType as 'main' | 'additional',
      foodId: Number(editFoodId),
    })
  }

  const handleDelete = () => {
    if (!confirm('Smazat krmení?')) {
      return
    }

    deleteFeed.mutate({ id: feed.id })
  }

  const isMain = feed.type === 'main'

  return (
    <Card 
      variant={isMain ? 'elevated' : 'default'}
      className={`mb-3 overflow-hidden transition-colors ${
        !isMain ? 'bg-bg-elevated' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start gap-4">
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

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Upravit
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={deleteFeed.isPending}
            onClick={handleDelete}
          >
            Smazat
          </Button>
        </div>
      </div>

      {isEditing && (
        <div className="border-t border-bg-elevated/50 p-4">
          <form onSubmit={handleUpdate} className="space-y-4">
            <SegmentedControl
              options={[
                { label: 'Hlavní chody', value: 'main' },
                { label: 'Doplňky', value: 'additional' }
              ]}
              value={editType}
              onChange={setEditType}
            />

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">Množství (ml)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">Jídlo</label>
                <select
                  required
                  value={editFoodId}
                  onChange={(e) => setEditFoodId(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
                >
                  {sortedFoods.length > 0 ? (
                    sortedFoods.map((food) => (
                      <option key={food.id} value={food.id}>
                        {food.emoji} {food.name}
                      </option>
                    ))
                  ) : (
                    <option value={feed.foodId}>
                      {feed.food?.emoji} {feed.food?.name || 'Aktuální jídlo'}
                    </option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                type="button"
                variant="secondary"
                onClick={resetEditForm}
              >
                Zrušit
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={updateFeed.isPending}
              >
                Uložit
              </Button>
            </div>
          </form>
        </div>
      )}
    </Card>
  )
}