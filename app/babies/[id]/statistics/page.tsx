// app/babies/[id]/statistics/page.tsx
import { deleteMeasurement, deletePoop } from '@/app/actions'
import { DeleteButton } from '@/components/DeleteButton'
import { prisma } from '@/lib/prisma'
import { formatOutputTime } from '@/lib/utils'
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
      <div className="max-w-md mx-auto p-4 pb-20 space-y-6">
         <div className="text-center">
            <h1 className="text-2xl font-bold text-baby-accent mb-1">{baby.name}'s Statistiky</h1>
            <p className="text-baby-soft">Growth & Health Tracking</p>
         </div>

         {/* Poop Statistics */}
         <div className="bg-baby-light rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-baby-accent mb-4">Statistika plín</h2>
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-baby-pink/30">
                        <th className="py-2 px-4 text-left text-baby-soft">Datum a čas</th>
                        <th className="py-2 px-4 text-right text-baby-soft">Barva</th>
                        <th className="py-2 px-4 text-right text-baby-soft">Konzistence</th>
                        <th className="py-2 px-4 text-right text-baby-soft">Množstív (g)</th>
                     </tr>
                  </thead>
                  <tbody>
                     {baby.poops.map((poop) => (
                        <tr key={poop.id} className="border-b border-baby-pink/10 hover:bg-baby-rose/30 transition-colors">
                           <td className="py-2 px-4">
                           {formatOutputTime(poop.poopTime)}
                           </td>
                           <td className="py-2 px-4 text-right">{poop.color}</td>
                           <td className="py-2 px-4 text-right">{poop.consistency}</td>
                           <td className="py-2 px-4 text-right">{poop.amount}</td>
                           <td className="py-2 px-4 text-right">
                              <DeleteButton
                                 onDelete={deletePoop}
                                 id={poop.id}
                                 babyId={baby.id}
                              />
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Daily Summary */}
            <div className="mt-4 grid grid-cols-2 gap-4">
               <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                  <p className="text-sm text-baby-soft mb-1">Plín dnes</p>
                  <p className="text-xl font-semibold text-baby-accent">
                     {baby.poops.filter(p =>
                        new Date(p.poopTime).toDateString() === new Date().toDateString()
                     ).length}
                  </p>
               </div>
               <div className="bg-baby-rose/20 p-4 rounded-xl text-center">
                  <p className="text-sm text-baby-soft mb-1">Průměr za den</p>
                  <p className="text-xl font-semibold text-baby-accent">
                     {Math.round(baby.poops.length /
                        (Math.max(1, Math.ceil((Date.now() - baby.createdAt.getTime()) / (1000 * 60 * 60 * 24))))
                     )}
                  </p>
               </div>
            </div>
         </div>

        
      </div>
   )
}