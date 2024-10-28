// app/components/FeedSection/FeedSection.tsx
'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { deleteFeed } from '@/app/actions'
import { DayPicker } from './DatePicker'
import { DeleteButton } from './DeleteButton'
import { revalidatePath } from 'next/cache'
import { formatOutputTime } from '@/lib/utils'
import StatsItem from './stats/item'

type FeedStats = {
   feeds: any[]
   totalMilk: number
   feedCount: number
   targetMilk: number
   remainingMilk: number
   remainingFeeds: number
   averageAmount: number
   recommendedNextAmount: number
}

export function FeedSection({
   initialStats,
   babyId
}: {
   initialStats: FeedStats
   babyId: number
}) {
   const [selectedDate, setSelectedDate] = useState(new Date())
   const [stats, setStats] = useState(initialStats)

   const handleDateChange = async (date: Date) => {
      setSelectedDate(date)
      try {
         const response = await fetch(`/api/feeds?babyId=${babyId}&date=${format(date, 'yyyy-MM-dd')}`)
         const newStats = await response.json()
         setStats(newStats)
      } catch (error) {
         console.error('Failed to fetch feeds:', error)
      }
   }

   // Update the feed stats when initial stats change
   useEffect(() => {
      setStats(initialStats)
   }
      , [initialStats])



   return (
      <div className="bg-baby-light rounded-2xl shadow-lg p-6">
         <h2 className="text-lg font-semibold text-baby-accent mb-4">Historie krmení</h2>

         <DayPicker
            selectedDate={selectedDate}
            onChange={handleDateChange}
         />

         <div className="grid grid-cols-2 gap-4 mb-6">
            <StatsItem label="Celkem" value={`${stats.feedCount}/8`}  />
            <StatsItem label="Celkem vypito" value={stats.totalMilk} units='ml'/>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="border-b border-baby-pink/30">
                     <th className="py-2 px-4 text-left text-baby-soft">Čas</th>
                     <th className="py-2 px-4 text-right text-baby-soft">Množství</th>
                     <th className="py-2 px-4 text-right text-baby-soft">Příští krmení</th>
                     <th className="py-2 px-4 text-right text-baby-soft"></th>
                  </tr>
               </thead>
               <tbody>
                  {stats.feeds.map((feed) => (
                     <tr key={feed.id} className="border-b border-baby-pink/10 hover:bg-baby-rose/30 transition-colors">
                        <td className="py-3 px-4">
                           {new Date(feed.feedTime).toLocaleTimeString('cs-CZ', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                              timeZone: 'UTC'
                           })}
                        </td>
                        <td className="py-3 px-4 text-right">{feed.amount}ml</td>
                        <td className="py-3 px-4 text-right">
                           {new Date(new Date(feed.feedTime).getTime() + 3 * 60 * 60 * 1000)
                              .toLocaleTimeString('cs-CZ', {
                                 hour: '2-digit',
                                 minute: '2-digit',
                                 hour12: false,
                                 timeZone: 'UTC'
                              })}
                        </td>
                        <td className="py-3 px-4 text-right">
                           <DeleteButton
                              onDelete={deleteFeed}
                              id={feed.id}
                              babyId={babyId}
                           />
                        </td>
                     </tr>
                  ))}

                  {
                     stats.feeds.length === 0 && (
                        <tr>
                           <td colSpan={4} className="py-8 text-center text-baby-soft">
                              No feeds recorded for this day
                           </td>
                        </tr>
                     )
                  }
               </tbody>
            </table>
         </div>
      </div>
   )
}