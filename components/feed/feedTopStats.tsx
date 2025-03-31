import { formatOutputTime } from "@/lib/utils";

type FeedTopStatsProps = {
   stats: {
      timeSinceLastFeed: string
      totalMilk: number
      feedCount: number
      feeds: Array<{
         foodId: number
         amount: number
         food: {
            emoji: string
         }
      }>
   }
   medianTimeDifference: number
}

export default function FeedTopStats({ stats, medianTimeDifference }: FeedTopStatsProps) {


   // Helper function to calculate total amount by food ID
   const calculateTotalAmount = (foodId?: number): number => {
      if (!stats.feeds) return 0;

      return stats.feeds.reduce((sum: number, feed) => {
         if (foodId !== undefined) {
            // Sum specific food ID
            return feed.foodId === foodId ? sum + feed.amount : sum;
         } else {
            // Sum all foods except ID 4
            return feed.foodId !== 4 ? sum + feed.amount : sum;
         }
      }, 0);
   }

   // Get the last feed time from stats.feeds array (they are sorted by feedTime ascending)
   const lastFeedTime = stats.feeds[stats.feeds.length - 1]?.feedTime;

   // Calculate total milk for foodId 4
   const totalMilkFoodId = calculateTotalAmount(4);

   // Calculate total for other foods (excluding foodId 4)
   const totalOtherFoods = calculateTotalAmount();


   // Get set of food.emoji from stats.feeds based on foodId 4 all rest is otherFoods
   const foodEmojis = getFoodEmojis(stats.feeds);

   return (
      <div className="bg-cardbg shadow-md rounded-lg p-4 mb-4">
         {/* Primary Info - Time Since Last Feed */}
         <div className="border-b border-gray-100 pb-4 mb-4">
            <div className="flex justify-between items-center">
               <h4 className="text-gray-800">Poslední jídlo </h4>
               <p className="text-2xl font-semibold">{lastFeedTime ? new Date(lastFeedTime).toUTCString().split(' ')[4] : ''}</p>
            </div>
         </div>

         {/* Secondary Info - Amounts */}
         <div className="flex flex-col justify-between items-start mb-4">
            <div className="mb-4 w-full">
               <h4 className="text-sm text-gray-800">Celkem vypito</h4>
               <div className="flex justify-between items-center text-xl font-semibold ">
                  <div className="text-baby-accent text-2xl">{totalMilkFoodId} <span className="text-sm text-gray-800">ml</span></div>
                  <div className="text-2xl">🍼</div>
               </div>
            </div>

            <div className="w-full">
               <h4 className="text-sm text-gray-800">Celkem snědeno</h4>
               <div className="flex justify-between items-center text-xl font-semibold">
                  <span className="text-baby-accent text-2xl">{totalOtherFoods} <span className="text-sm text-gray-800">g</span></span>
                  <div className="flex items-center gap-2">
                     {Array.from(foodEmojis).map((emoji, index) => (
                        <span key={index} className="text-2xl">{emoji}</span>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Additional Info */}
         <div className="text-right border-t border-gray-100 pt-4">
            <div className="text-sm text-gray-800 flex justify-between items-center">
               <p>Počet jídel dnes</p>
               <p className=" font-semibold">{stats.feedCount}</p>
            </div>
            <div className="text-right flex justify-between items-center">
               <p className="text-xs text-gray-800 text-right">od posledního krmení</p>
               <p className="text-md text-gray-800">{formatOutputTime(new Date(medianTimeDifference))}</p>
            </div>
         </div>
      </div>

   )
}



function getFoodEmojis(feeds: Array<{ foodId: number; amount: number; food: { emoji: string } }>): Set<string> {
   return new Set(feeds.filter(feed => feed.foodId !== 4).map(feed => feed.food.emoji));
}
