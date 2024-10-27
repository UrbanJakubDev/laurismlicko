
// app/babies/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { createMeasurement, createFeed, getFeedStats, createPoop } from '@/app/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { FeedSection } from '@/components/FeedSection'



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
            <p className="text-baby-soft">Daily Tracking</p>
         </div>



         {/* Today's Progress */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Today's Progress</h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                  <p className="text-sm text-baby-soft mb-1">Total Milk</p>
                  <p className="text-xl font-semibold">{stats.totalMilk}ml</p>
               </div>
               <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                  <p className="text-sm text-baby-soft mb-1">Remaining</p>
                  <p className="text-xl font-semibold">{stats.remainingMilk}ml</p>
               </div>
               <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                  <p className="text-sm text-baby-soft mb-1">Feeds Done</p>
                  <p className="text-xl font-semibold">{stats.feedCount}/{8}</p>
               </div>
               <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                  <p className="text-sm text-baby-soft mb-1">Next Feed</p>
                  <p className="text-xl font-semibold">{stats.recommendedNextAmount}ml</p>
               </div>
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
                  {Math.round((stats.totalMilk / stats.targetMilk) * 100)}% of daily target
               </p>
            </div>
         </div>

         {/* Quick Add Feed */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Quick Add Feed</h2>
            <form action={createFeed} className="space-y-4">
               <input type="hidden" name="babyId" value={baby.id} />
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Feed Time</label>
                  <input
                     type="datetime-local"
                     name="feedTime"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Amount (ml)</label>
                  <input
                     type="number"
                     name="amount"
                     required
                     defaultValue={stats.recommendedNextAmount}
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  />
               </div>
               <SubmitButton>
                  Add Feed
               </SubmitButton>
            </form>
         </div>

         {/* Feed History */}
         <FeedSection 
        initialStats={stats} 
        babyId={baby.id} 
      />

         {/* Latest Measurements */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Latest Measurements</h2>
            {latestMeasurement ? (
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                     <p className="text-sm text-baby-soft mb-1">Weight</p>
                     <p className="text-xl font-semibold">{latestMeasurement.weight}g</p>
                  </div>
                  <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                     <p className="text-sm text-baby-soft mb-1">Height</p>
                     <p className="text-xl font-semibold">{latestMeasurement.height}cm</p>
                  </div>
                  <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                     <p className="text-sm text-baby-soft mb-1">Daily Target</p>
                     <p className="text-xl font-semibold">{latestMeasurement.dailyMilkAmount}ml</p>
                  </div>
                  <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                     <p className="text-sm text-baby-soft mb-1">Per Feed</p>
                     <p className="text-xl font-semibold">{latestMeasurement.averageFeedAmount}ml</p>
                  </div>
               </div>
            ) : (
               <div className="text-center py-4 text-baby-soft">
                  No measurements recorded yet
               </div>
            )}
         </div>

         {/* Add Measurement */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">New Measurement</h2>
            <form action={createMeasurement} className="space-y-4">
               <input type="hidden" name="babyId" value={baby.id} />
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Weight (g)</label>
                  <input
                     type="number"
                     name="weight"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                     placeholder="Enter weight in grams"
                  />
               </div>
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Height (cm)</label>
                  <input
                     type="number"
                     step="0.1"
                     name="height"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                     placeholder="Enter height in cm"
                  />
               </div>
               <SubmitButton>
                  Add Measurement
               </SubmitButton>
            </form>
         </div>


         {/* Add Poop Record */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Record Diaper Change</h2>
            <form action={createPoop} className="space-y-4">
               <input type="hidden" name="babyId" value={baby.id} />
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Time</label>
                  <input
                     type="datetime-local"
                     name="poopTime"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Color</label>
                  <select
                     name="color"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  >
                     <option value="">Select color</option>
                     <option value="yellow">Yellow</option>
                     <option value="brown">Brown</option>
                     <option value="green">Green</option>
                     <option value="black">Black</option>
                     <option value="red">Red</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Consistency</label>
                  <select
                     name="consistency"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                  >
                     <option value="">Select consistency</option>
                     <option value="liquid">Liquid</option>
                     <option value="soft">Soft</option>
                     <option value="normal">Normal</option>
                     <option value="hard">Hard</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Amount (g)</label>
                  <input
                     type="number"
                     name="amount"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                     placeholder="Enter amount in grams"
                  />
               </div>
               <SubmitButton>
                  Record Diaper Change
               </SubmitButton>
            </form>
         </div>

        
      </div>
   )
}