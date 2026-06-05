import { getServerCaller } from '@/server/caller'
import { getDeviceTimeZone } from '@/lib/utils'
import { formatInTimeZone } from 'date-fns-tz'
import { FeedSection } from '@/components/feed/FeedSection'
import { AddFeedSheet } from '@/components/feed/AddFeedSheet'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function BabyPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const babyId = parseInt(id)

  if (isNaN(babyId)) {
    return <div className="p-4">Neplatné ID profilu</div>
  }

  const caller = await getServerCaller()
  const todayLocal = formatInTimeZone(
    new Date(),
    getDeviceTimeZone(),
    "yyyy-MM-dd'T'HH:mm:ss"
  )

  const stats = await caller.feed.getStats({
    babyId,
    date: todayLocal,
    timezone: getDeviceTimeZone()
  })

  const baby = await caller.baby.getById({ id: babyId })

  if (!baby) return <div className="p-4">Profil nenalezen</div>

  // Average feeds logic is now simplified or handled inside stats if needed.
  // For now, let's use the stats target feeds.
  const targetFeeds = stats.feedsPerDay || 10
  const progressPercent = stats.targetMilk > 0 ? (stats.totalMilk / stats.targetMilk) * 100 : 0

  return (
    <div className="min-h-screen safe-area-top safe-area-bottom pb-20 bg-bg-primary">
      <PageHeader title={baby.name} subtitle={`Dnešní přehled`} />

      <div className="p-4 space-y-6">
        
        {/* Today's Progress Card */}
        <Card variant="glass" className="p-6">
          <div className="flex flex-col items-center mb-6">
            <ProgressRing 
              progress={progressPercent} 
              size={160} 
              strokeWidth={14}
              label={`${stats.totalMilk} ml`}
              sublabel={`z ${stats.targetMilk} ml`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-elevated p-4 rounded-xl text-center">
              <span className="block text-text-muted text-xs font-medium uppercase mb-1">Zbývá vypít</span>
              <span className="text-xl font-bold text-text-primary">{stats.remainingMilk} ml</span>
            </div>
            <div className="bg-bg-elevated p-4 rounded-xl text-center">
              <span className="block text-text-muted text-xs font-medium uppercase mb-1">Počet krmení</span>
              <span className="text-xl font-bold text-text-primary">{stats.feedCount} / {targetFeeds}</span>
            </div>
            <div className="bg-bg-elevated p-4 rounded-xl text-center col-span-2 flex justify-between items-center">
              <span className="text-text-muted text-xs font-medium uppercase">Průměrná dávka</span>
              <span className="text-lg font-bold text-text-primary">{stats.averageAmount} ml</span>
            </div>
          </div>
        </Card>

        {/* Quick Add Feed */}
        <AddFeedSheet 
          babyId={baby.id} 
          averageAmount={stats.averageAmount} 
          remainingAmount={stats.remainingMilk} 
        />

        {/* Feed History (Today) */}
        <FeedSection babyId={baby.id} type="list" />

      </div>
    </div>
  )
}
