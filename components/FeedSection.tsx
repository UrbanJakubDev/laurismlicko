// app/components/FeedSection/FeedSection.tsx
'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { deleteFeed } from '@/app/actions'
import { DayPicker } from './DatePicker'
import { DeleteButton } from './DeleteButton'
import { formatOutputTime } from '@/lib/utils'
import StatsItem from './stats/item'
import { Baby } from '@/lib/types'
import { Table } from './Table'

type FeedStats = {
   feeds: any[]
   totalMilk: number
   feedCount: number
   targetMilk: number
   remainingMilk: number
   remainingFeeds: number
   averageAmount: number
   recommendedNextAmount: number
   timeSinceLastFeed: string
}

export function FeedSection({
   initialStats,
   baby
}: {
   initialStats: FeedStats
   baby: Baby
}) {
   const [selectedDate, setSelectedDate] = useState(new Date())
   const [stats, setStats] = useState(initialStats)

   const handleDateChange = async (date: Date) => {
      setSelectedDate(date)
      try {
         const response = await fetch(`/api/feeds?babyId=${baby.id}&date=${format(date, 'yyyy-MM-dd')}`)
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


   // Calculate median time difference between feeds return in hours and minutes as
   const medianTimeDifference = stats.feeds.reduce((total, feed, index) => {
      if (index === 0) return 0
      return total + (feed.feedTime - stats.feeds[index - 1].feedTime)
   }, 0) / (stats.feeds.length - 1)



   return (
      <div className="bg-baby-light rounded-2xl shadow-lg p-6">
         <h2 className="text-lg font-semibold text-baby-accent mb-4">Historie krmení</h2>

         <DayPicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
         />

         <div className="grid grid-cols-2 gap-4 mb-6">
            <StatsItem label="Poslední jídlo před" value={stats.timeSinceLastFeed} units='' />
            <StatsItem label="Celkem vypito" value={stats.totalMilk} units='ml' />
            <StatsItem label="Celkem" value={stats.feedCount} />
            <StatsItem
               label="Prümerná doba mezi jídly"
               value={formatOutputTime(medianTimeDifference)}
               units=''
            />
         </div>

         <Table
            data={stats.feeds}
            columns={[
               {
                  header: 'Čas',
                  accessor: (feed) => formatOutputTime(feed.feedTime),
                  align: 'left',
                  subrow: 'top',
                  mobileLabel: 'Čas krmení'
               },
               {
                  header: 'Množství',
                  accessor: 'amount',
                  align: 'right',
                  subrow: 'top',
                  mobileLabel: 'Vypito',
                  units: 'ml'
               },
               {
                  header: 'Typ',
                  accessor: (feed) => feed.type === 'additional' ? 'Doplňkové' : 'Hlavní',
                  align: 'left',
                  subrow: 'bottom',
                  mobileLabel: 'Typ krmení'
               },
               {
                  header: 'Čas mezi jídly',
                  accessor: 'timeSinceLastFeed',
                  align: 'right',
                  subrow: 'bottom',
                  mobileLabel: 'Interval'
               },
               {
                  header: '',
                  accessor: (feed) => (
                     <DeleteButton
                        onDelete={deleteFeed}
                        id={feed.id}
                        babyId={baby.id}
                     />
                  ),
                  align: 'right'
               }
            ]}
         />
      </div>
   )
}