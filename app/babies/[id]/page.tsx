
// app/babies/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { createMeasurement, createFeed, getFeedStats, createPoop } from '@/app/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { FeedSection } from '@/components/FeedSection'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import StatsItem from '@/components/stats/item'



export default async function BabyPage({
   params,
}: {
   params: { id: string }
}) {
   const { id } = await params
   const babyId = parseInt(id)
   const today = new Date()
   const stats = await getFeedStats(babyId, today)

   const baby = await prisma.baby.findUnique({
      where: { id: babyId },
      include: {
         measurements: {
            orderBy: { createdAt: 'desc' },
            take: 1
         }
      }
   })

   if (!baby) return <div>Baby not found</div>

   const latestMeasurement = baby.measurements[0]

   return (
      <div className="max-w-md mx-auto p-4 pb-20 space-y-6">
         {/* Header */}
         <div className="text-center">
            <h1 className="text-2xl font-bold text-baby-accent mb-1">{baby.name}</h1>
            <p className="text-baby-soft">Denní přehled</p>
         </div>



         {/* Today's Progress */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Dnešní přehled</h2>
            <div className="grid grid-cols-2 gap-4">
               <StatsItem label="Váha" value={latestMeasurement.weight} units='g' />
               <StatsItem label="Délka" value={latestMeasurement.height} units='cm' />
               <StatsItem label="Mlíčko Celkem" value={stats.totalMilk} units='ml' />
               <StatsItem label="Zbývá vypít" value={stats.remainingMilk} units='ml'/>
               <StatsItem label="Krmení" value={`${stats.feedCount}/8`} />
               <StatsItem label="Příští krmení cca" value={stats.recommendedNextAmount} units='ml' />
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
                  <label className="block text-sm text-baby-soft">Mnaožství (ml)</label>
                  <input
                     type="number"
                     name="amount"
                     required
                     defaultValue={stats.recommendedNextAmount}
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  />
               </div>
               <SubmitButton>
                  Šup to tam
               </SubmitButton>
            </form>
         </div>

         {/* Feed History */}
         <FeedSection
            initialStats={stats}
            babyId={baby.id}
         />


         {/* Add Poop Record */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Výměna plíny</h2>
            <form action={createPoop} className="space-y-4">
               <input type="hidden" name="babyId" value={baby.id} />
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Čas</label>
                  <input
                     type="datetime-local"
                     name="feedTime"
                     required
                     defaultValue={formatInTimeZone(new Date(), 'Europe/Prague', "yyyy-MM-dd'T'HH:mm")}
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Barva</label>
                  <select
                     name="color"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  >
                     <option value="">Vyber barvu</option>
                     <option value="yellow">Žlutá</option>
                     <option value="brown">Hnědá</option>
                     <option value="green">Zelená</option>
                     <option value="black">Černá</option>
                     <option value="red">Červená</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Konzistence</label>
                  <select
                     name="consistency"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  >
                     <option value="">Vyber konzistenci</option>
                     <option value="liquid">Tekuté</option>
                     <option value="soft">Měkké</option>
                     <option value="normal">Nomrální</option>
                     <option value="hard">Suché</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Amount (g)</label>
                  <input
                     type="number"
                     name="amount"
                     required
                     defaultValue={0}
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                     placeholder="Enter amount in grams"
                  />
               </div>
               <SubmitButton>
                  Přidat záznam
               </SubmitButton>
            </form>
         </div>


      </div>
   )
}