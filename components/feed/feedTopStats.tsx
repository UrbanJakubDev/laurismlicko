import { formatDuration, formatOutputTime } from "@/lib/utils"
import { Card } from "../ui/Card"

type FeedTopStatsProps = {
  stats: {
    timeSinceLastFeed: string
    totalMilk: number
    feedCount: number
    feeds: Array<{
      foodId: number
      amount: number
      feedTime?: string
      food: {
        emoji: string
      }
    }>
  }
  medianTimeDifference: number
}

export default function FeedTopStats({ stats, medianTimeDifference }: FeedTopStatsProps) {

  const calculateTotalAmount = (foodId?: number): number => {
    if (!stats.feeds) return 0
    return stats.feeds.reduce((sum: number, feed) => {
      if (foodId !== undefined) {
        return feed.foodId === foodId ? sum + feed.amount : sum
      } else {
        return feed.foodId !== 4 ? sum + feed.amount : sum
      }
    }, 0)
  }

  const lastFeedTime = stats.feeds[stats.feeds.length - 1]?.feedTime
  const totalMilkFoodId = calculateTotalAmount(4)
  const totalOtherFoods = calculateTotalAmount()
  const foodEmojis = getFoodEmojis(stats.feeds)

  return (
    <Card className="p-5 space-y-4">
      {/* Primary Info - Time Since Last Feed */}
      <div className="flex justify-between items-center border-b border-bg-elevated pb-4">
        <h4 className="text-text-secondary font-medium">Poslední jídlo</h4>
        <div className="text-xl font-bold text-text-primary">
          {lastFeedTime ? formatOutputTime(new Date(lastFeedTime)) : '--:--'}
        </div>
      </div>

      {/* Secondary Info - Amounts */}
      <div className="grid grid-cols-2 gap-4 border-b border-bg-elevated pb-4">
        <div>
          <h4 className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Mléko celkem</h4>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-accent-primary">{totalMilkFoodId}</span>
            <span className="text-sm font-medium text-text-secondary">ml</span>
            <span className="text-xl">🍼</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Příkrmy celkem</h4>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-accent-secondary">{totalOtherFoods}</span>
            <span className="text-sm font-medium text-text-secondary">g</span>
            <div className="flex items-center text-xl">
              {Array.from(foodEmojis).map((emoji, index) => (
                <span key={index}>{emoji}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs text-text-secondary font-medium mb-1">Počet jídel dnes</h4>
          <p className="text-lg font-bold text-text-primary">{stats.feedCount}</p>
        </div>
        <div className="text-right">
          <h4 className="text-xs text-text-secondary font-medium mb-1">Průměrná pauza</h4>
          <p className="text-lg font-bold text-text-primary">{formatDuration(medianTimeDifference)}</p>
        </div>
      </div>
    </Card>
  )
}

function getFoodEmojis(feeds: Array<{ foodId: number; amount: number; food: { emoji: string } }>): Set<string> {
  return new Set(feeds.filter(feed => feed.foodId !== 4).map(feed => feed.food.emoji))
}
