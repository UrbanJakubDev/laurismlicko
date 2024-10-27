// app/components/FeedSection/FeedSection.tsx
'use client'
import { useState } from 'react'
import { format, addHours, parseISO } from 'date-fns'
import { deleteFeed } from '@/app/actions'
import { DayPicker } from './DatePicker'
import { DeleteButton } from './DeleteButton'

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

   return (
      <div className="bg-baby-light rounded-2xl shadow-lg p-6">
         <h2 className="text-lg font-semibold text-baby-accent mb-4">Feed History</h2>

         <DayPicker
            selectedDate={selectedDate}
            onChange={handleDateChange}
         />

         <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
               <p className="text-sm text-baby-soft mb-1">Total Feeds</p>
               <p className="text-xl font-semibold">{stats.feedCount}/8</p>
            </div>
            <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
               <p className="text-sm text-baby-soft mb-1">Total Amount</p>
               <p className="text-xl font-semibold">{stats.totalMilk}ml</p>
            </div>
         </div>

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
                        <td className="py-3 px-4">
                           {format(
                              new Date(new Date(feed.feedTime).getTime() + new Date().getTimezoneOffset() * 60000),
                              'HH:mm'
                           )}
                        </td>
                        <td className="py-3 px-4 text-right">{feed.amount}ml</td>
                        <td className="py-3 px-4 text-right">
                           {format(
                              new Date(new Date(feed.feedTime).getTime() + new Date().getTimezoneOffset() * 60000 + 3 * 3600000),
                              'HH:mm'
                           )}
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