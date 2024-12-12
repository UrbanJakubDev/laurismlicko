
// app/babies/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { createFeed, getFeedStats } from '@/app/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { FeedSection } from '@/components/FeedSection'
import { formatInTimeZone } from 'date-fns-tz'
import StatsItem from '@/components/stats/item'
import { Baby, Feed } from '@/lib/types'



export default async function BabyPage({
   params,
}: {
   params: { id: string }
}) {
   const { id } = await params
   const babyId = parseInt(id)


   const today = new Date(Date.now() - (new Date().getTimezoneOffset() * 60 * 1000));
   const stats = await getFeedStats(babyId, today)

   const baby = await prisma.baby.findUniqueOrThrow({
      where: { id: babyId },
      include: {
         measurements: {
            orderBy: { createdAt: 'desc' },
            take: 1,
         }
      }
   }).catch(() => null) as Baby

   if (!baby) return <div>Baby not found</div>

   const latestMeasurement = baby.measurements[0]


   // Get average feed amount for the all days in db
   const allMeasurements = await prisma.feed.findMany({
      where: { babyId },
      orderBy: { createdAt: 'desc' }
   }) as Feed[]

   // Function to calculate average feeds per day from count of unique days with feeds and feeds in that day
   const calculateAverageFeeds = (feeds: Feed[]) => {
      const uniqueDays = new Set(feeds.map(feed => formatInTimeZone(feed.feedTime, 'Europe/Prague', 'yyyy-MM-dd')))
      return Math.round(feeds.length / uniqueDays.size)
   }


   return (
      <div className="max-w-md mx-auto p-4 pb-20 space-y-6">
         {/* Header */}
         <div className="text-center">
            <h1 className="text-2xl font-bold text-baby-accent mb-1">{baby.name}</h1>
            <p className="text-baby-soft">Denní přehled ...</p>
         </div>

         {/* Today's Progress */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Dnešní přehled</h2>
            <div className="grid grid-cols-2 gap-4">
               <StatsItem label="Váha" value={latestMeasurement.weight} units='g' />
               <StatsItem label="Délka" value={latestMeasurement.height} units='cm' />
               <StatsItem label="Mlíčko Celkem" value={stats.totalMilk} units='ml' />
               <StatsItem label="Zbývá vypít" value={stats.remainingMilk} units='ml' />
               <StatsItem label="Krmení" value={`${stats.feedCount} / ${calculateAverageFeeds(allMeasurements)}`} />
               <StatsItem label="Průmerné množství" value={Math.round(stats.totalMilk / stats.feedCount)} units='ml' />
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
               <div className="w-full bg-baby-rose/20 rounded-full h-4">
                  <div
                     className="bg-baby-accent h-4 rounded-full transition-all duration-500"
                     style={{ width: `${Math.min(100, (stats.totalMilk / stats.targetMilk) * 100)}%` }}
                  />
               </div>
               <p className="text-center text-sm text-baby-soft mt-2">
                  {Math.round((stats.totalMilk / stats.targetMilk) * 100)}% of denního cíle
               </p>
            </div>
         </div>

         {/* Quick Add Feed */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Přidat krmení</h2>
            <form action={createFeed} className="space-y-4">
               <input type="hidden" name="babyId" value={baby.id} />
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Čas krmení</label>
                  <input
                     type="datetime-local"
                     name="feedTime"
                     required
                     defaultValue={formatInTimeZone(new Date(), 'Europe/Prague', "yyyy-MM-dd'T'HH:mm")}
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Množství (ml)</label>
                  <input
                     type="number"
                     name="amount"
                     required
                     defaultValue={stats.averageAmount >= stats.remainingMilk ? stats.remainingMilk : stats.averageAmount}
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  />
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Typ krmení</label>
                  <select
                     name="type"
                     required
                     defaultValue="main"
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  >
                     <option value="main">Hlavní</option>
                     <option value="additional">Doplňkové</option>
                  </select>
               </div>

               </div>
               <SubmitButton>
                  Přidat krmení
               </SubmitButton>
            </form>
         </div>

         {/* Feed Section */}
         <div className="space-y-4">
            <FeedSection
               initialStats={stats}
               baby={baby}
            />
         </div>

      </div>
   )
}