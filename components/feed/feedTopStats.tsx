import StatsItem from "../stats/item";
import { formatOutputTime } from "@/lib/utils";

type FeedTopStatsProps = {
    stats: FeedStats
    medianTimeDifference: number
}


export default function FeedTopStats({ stats, medianTimeDifference }: FeedTopStatsProps) {
   return (
    <div className="grid grid-cols-2 gap-4 mb-6">
    <StatsItem label="Poslední jídlo před" value={stats.timeSinceLastFeed} units='' />
    <StatsItem label="Celkem vypito" value={stats.totalMilk} units='ml' />
    <StatsItem label="Celkem" value={stats.feedCount} />
    <StatsItem
       label="Prümerná doba mezi jídly"
       value={formatOutputTime(new Date(medianTimeDifference))}
       units=''
    />
  
 </div>
   )
}