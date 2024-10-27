// app/babies/[id]/statistics/page.tsx
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export default async function StatisticsPage({
   params,
 }: {
   params: { id: string }
 }) {
  const babyId = parseInt(params.id)
  
  const baby = await prisma.baby.findUnique({
    where: { id: babyId },
    include: {
      measurements: {
        orderBy: { createdAt: 'desc' },
      },
      poops: {
        orderBy: { poopTime: 'desc' },
      }
    }
  })

  if (!baby) return <div>Baby not found</div>

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-baby-accent mb-1">{baby.name}'s Statistics</h1>
        <p className="text-baby-soft">Growth & Health Tracking</p>
      </div>

      {/* Measurements Statistics */}
      <div className="bg-baby-light rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-baby-accent mb-4">Growth Measurements</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-baby-pink/30">
                <th className="py-2 px-4 text-left text-baby-soft">Date</th>
                <th className="py-2 px-4 text-right text-baby-soft">Weight (g)</th>
                <th className="py-2 px-4 text-right text-baby-soft">Height (cm)</th>
                <th className="py-2 px-4 text-right text-baby-soft">Daily Milk (ml)</th>
              </tr>
            </thead>
            <tbody>
              {baby.measurements.map((measurement) => (
                <tr key={measurement.id} className="border-b border-baby-pink/10 hover:bg-baby-rose/30 transition-colors">
                  <td className="py-2 px-4">{format(measurement.createdAt, 'MMM d, yyyy')}</td>
                  <td className="py-2 px-4 text-right">{measurement.weight}</td>
                  <td className="py-2 px-4 text-right">{measurement.height}</td>
                  <td className="py-2 px-4 text-right">{measurement.dailyMilkAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Growth Charts would go here */}
        <div className="mt-4 p-4 bg-baby-rose/20 rounded-xl">
          <p className="text-sm text-baby-soft text-center">
            Growth tracking visualizations coming soon! 📈
          </p>
        </div>
      </div>

      {/* Poop Statistics */}
      <div className="bg-baby-light rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-baby-accent mb-4">Diaper Tracking</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-baby-pink/30">
                <th className="py-2 px-4 text-left text-baby-soft">Date & Time</th>
                <th className="py-2 px-4 text-right text-baby-soft">Color</th>
                <th className="py-2 px-4 text-right text-baby-soft">Consistency</th>
                <th className="py-2 px-4 text-right text-baby-soft">Amount (g)</th>
              </tr>
            </thead>
            <tbody>
              {baby.poops.map((poop) => (
                <tr key={poop.id} className="border-b border-baby-pink/10 hover:bg-baby-rose/30 transition-colors">
                  <td className="py-2 px-4">{format(poop.poopTime, 'MMM d, HH:mm')}</td>
                  <td className="py-2 px-4 text-right">{poop.color}</td>
                  <td className="py-2 px-4 text-right">{poop.consistency}</td>
                  <td className="py-2 px-4 text-right">{poop.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Daily Summary */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
            <p className="text-sm text-baby-soft mb-1">Today's Count</p>
            <p className="text-xl font-semibold text-baby-accent">
              {baby.poops.filter(p => 
                new Date(p.poopTime).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
            <p className="text-sm text-baby-soft mb-1">Average/Day</p>
            <p className="text-xl font-semibold text-baby-accent">
              {Math.round(baby.poops.length / 
                (Math.max(1, Math.ceil((Date.now() - baby.createdAt.getTime()) / (1000 * 60 * 60 * 24))))
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 bg-baby-light rounded-full shadow-lg p-4">
        <div className="flex justify-around">
          <a href={`/babies/${baby.id}`} className="text-baby-accent hover:text-baby-soft transition-colors">
            Dashboard
          </a>
          <a href={`/babies/${baby.id}/statistics`} className="text-baby-accent hover:text-baby-soft transition-colors">
            Statistics
          </a>
        </div>
      </nav>
    </div>
  )
}