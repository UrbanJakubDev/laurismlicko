import { createMeasurement, deleteMeasurement, getFeedStats } from '@/app/actions'
import { DeleteButton } from '@/components/DeleteButton'
import { SubmitButton } from '@/components/SubmitButton'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import React from 'react'

export default async function MeasurementsPage({
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
         <div className="text-center">
            <h1 className="text-2xl font-bold text-baby-accent mb-1">{baby.name}'s Statistiky</h1>
            <p className="text-baby-soft">Growth & Health Tracking</p>
         </div>
         {/* Latest Measurements */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Poslední měření</h2>
            {latestMeasurement ? (
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                     <p className="text-sm text-baby-soft mb-1">Váha</p>
                     <p className="text-xl font-semibold">{latestMeasurement.weight}g</p>
                  </div>
                  <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                     <p className="text-sm text-baby-soft mb-1">Délka</p>
                     <p className="text-xl font-semibold">{latestMeasurement.height}cm</p>
                  </div>
                  <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                     <p className="text-sm text-baby-soft mb-1">Denní cíl mléka</p>
                     <p className="text-xl font-semibold">{latestMeasurement.dailyMilkAmount}ml</p>
                  </div>
                  <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                     <p className="text-sm text-baby-soft mb-1">Množství na dávku</p>
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
            <h2 className="text-lg font-semibold text-baby-accent mb-4">Nové měření</h2>
            <form action={createMeasurement} className="space-y-4">
               <input type="hidden" name="babyId" value={baby.id} />
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Váha (g)</label>
                  <input
                     type="number"
                     name="weight"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                     placeholder="Zadej váhu v gramech"
                  />
               </div>
               <div className="space-y-2">
                  <label className="block text-sm text-baby-soft">Délka (cm)</label>
                  <input
                     type="number"
                     step="0.1"
                     name="height"
                     required
                     className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                     placeholder="Zadej délku v centimetrech"
                  />
               </div>
               <SubmitButton>
                  Přidat měření
               </SubmitButton>
            </form>
         </div>

         {/* Measurements Statistics */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-baby-accent mb-4">Statistika jak roste</h2>
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-baby-pink/30">
                        <th className="py-2 px-4 text-left text-baby-soft">Datum</th>
                        <th className="py-2 px-4 text-right text-baby-soft">Váha (g)</th>
                        <th className="py-2 px-4 text-right text-baby-soft">Délka (cm)</th>
                        <th className="py-2 px-4 text-right text-baby-soft">Mléko denně (ml)</th>
                     </tr>
                  </thead>
                  <tbody>
                     {baby.measurements.map((measurement) => (
                        <tr key={measurement.id} className="border-b border-baby-pink/10 hover:bg-baby-rose/30 transition-colors">
                           <td className="py-2 px-4">{format(measurement.createdAt, 'MMM d, yyyy')}</td>
                           <td className="py-2 px-4 text-right">{measurement.weight}</td>
                           <td className="py-2 px-4 text-right">{measurement.height}</td>
                           <td className="py-2 px-4 text-right">{measurement.dailyMilkAmount}</td>
                           <td className="py-2 px-4 text-right">
                              <DeleteButton
                                 onDelete={deleteMeasurement}
                                 id={measurement.id}
                                 babyId={baby.id}
                              />
                           </td>
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
      </div>
   )
}