import { useState } from 'react'
import { formatOutputTime } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { Card } from '../ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTrash } from 'react-icons/fa6'

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
  const utils = trpc.useUtils()
  
  const deleteFeed = trpc.feed.delete.useMutation({
    onSuccess: () => {
      utils.feed.getStats.invalidate()
    }
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteFeed.mutate({ id: feed.id })
  }

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
          >
            <div className="p-3 flex justify-end bg-error/5">
              <button
                onClick={handleDelete}
                disabled={deleteFeed.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                <FaTrash />
                {deleteFeed.isPending ? 'Mažu...' : 'Smazat krmení'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}