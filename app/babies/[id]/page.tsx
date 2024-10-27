// app/babies/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { createMeasurement, createFeed, getFeedStats, createPoop, deleteFeed } from '@/app/actions'
import { format, addHours } from 'date-fns'
import { DeleteButton } from '@/components/DeleteButton'

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
         },
         feeds: {
            orderBy: { feedTime: 'desc' },
            take: 10
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
               <button
                  type="submit"
                  className="w-full bg-baby-accent text-white py-3 rounded-xl hover:bg-baby-soft transition-colors duration-200"
               >
                  Add Feed
               </button>
            </form>
         </div>

         {/* Feed History */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Today's Feeds</h2>
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-baby-pink/30">
                        <th className="py-2 px-4 text-left text-baby-soft">Time</th>
                        <th className="py-2 px-4 text-right text-baby-soft">Amount</th>
                        <th className="py-2 px-4 text-right text-baby-soft">Next Feed</th>
                        <th className="py-2 px-4 text-right text-baby-soft">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {stats.feeds.map((feed) => (
                        <tr key={feed.id} className="border-b border-baby-pink/10 hover:bg-baby-rose/30 transition-colors">
                           <td className="py-3 px-4">{format(feed.feedTime, 'HH:mm')}</td>
                           <td className="py-3 px-4 text-right">{feed.amount}ml</td>
                           <td className="py-3 px-4 text-right">
                              {format(addHours(feed.feedTime, 3), 'HH:mm')}
                           </td>
                           <td className="py-3 px-4 text-right">
                              <DeleteButton
                                 onDelete={deleteFeed}
                                 id={feed.id}
                                 babyId={baby.id}
                              />
                           </td>
                        </tr>
                     ))}
                     {stats.feeds.length === 0 && (
                        <tr>
                           <td colSpan={3} className="py-6 text-center text-baby-soft">
                              No feeds recorded today
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

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
               <button
                  type="submit"
                  className="w-full bg-baby-accent text-white py-3 rounded-xl hover:bg-baby-soft transition-colors duration-200"
               >
                  Add Measurement
               </button>
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
               <button
                  type="submit"
                  className="w-full bg-baby-accent text-white py-3 rounded-xl hover:bg-baby-soft transition-colors duration-200"
               >
                  Record Diaper Change
               </button>
            </form>
         </div>

         {/* Navigation */}
         <nav className="fixed bottom-4 left-4 right-4 bg-baby-light rounded-full shadow-lg p-4 backdrop-blur-sm">
            <div className="flex justify-around max-w-md mx-auto">
               <a
                  href={`/babies/${baby.id}`}
                  className="text-baby-accent hover:text-baby-soft transition-colors font-medium"
               >
                  Dashboard
               </a>
               <a
                  href={`/babies/${baby.id}/statistics`}
                  className="text-baby-accent hover:text-baby-soft transition-colors font-medium"
               >
                  Statistics
               </a>
            </div>
         </nav>
      </div>
   )
}