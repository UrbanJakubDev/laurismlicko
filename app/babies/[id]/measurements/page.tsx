'use client'

import { useState, use } from 'react'
import { trpc } from '@/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

export default function MeasurementsPage({
   params,
}: {
   params: Promise<{ id: string }>
}) {
   const { id } = use(params)
   const babyId = parseInt(id)

   const [weight, setWeight] = useState('')
   const [height, setHeight] = useState('')
   const [isCreating, setIsCreating] = useState(false)

   const utils = trpc.useUtils()
   const { data: baby } = trpc.baby.getById.useQuery({ id: babyId })
   const { data: measurements, isLoading } = trpc.measurement.list.useQuery({ babyId })

   const createMeasurement = trpc.measurement.create.useMutation({
      onSuccess: () => {
         utils.measurement.list.invalidate()
         setWeight('')
         setHeight('')
         setIsCreating(false)
      }
   })

   const deleteMeasurement = trpc.measurement.delete.useMutation({
      onSuccess: () => {
         utils.measurement.list.invalidate()
      }
   })

   if (isLoading || !baby) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
         </div>
      )
   }

   const latestMeasurement = measurements?.[0]

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      createMeasurement.mutate({
         babyId,
         weight: Number(weight),
         height: Number(height),
      })
   }

   return (
      <div className="min-h-screen safe-area-top safe-area-bottom pb-20 bg-bg-primary">
         <PageHeader title={`${baby.name}`} subtitle="Měření a růst" />

         <div className="p-4 space-y-6">
            
            {/* Latest Measurements */}
            <Card variant="elevated" className="p-5 bg-gradient-to-br from-bg-card to-accent-primary/5">
               <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Poslední měření</h2>
               {latestMeasurement ? (
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-bg-elevated p-4 rounded-2xl text-center">
                        <span className="block text-text-muted text-xs font-medium uppercase mb-1">Váha</span>
                        <span className="text-xl font-bold text-accent-primary">{latestMeasurement.weight} <span className="text-sm text-text-secondary">g</span></span>
                     </div>
                     <div className="bg-bg-elevated p-4 rounded-2xl text-center">
                        <span className="block text-text-muted text-xs font-medium uppercase mb-1">Délka</span>
                        <span className="text-xl font-bold text-accent-primary">{latestMeasurement.height} <span className="text-sm text-text-secondary">cm</span></span>
                     </div>
                     <div className="bg-bg-elevated p-4 rounded-2xl text-center col-span-2 flex justify-between items-center">
                        <span className="text-text-muted text-xs font-medium uppercase">Doporučená dávka</span>
                        <span className="text-lg font-bold text-text-primary">{Math.round(latestMeasurement.averageFeedAmount)} ml</span>
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-6 text-text-muted">
                     Zatím žádné záznamy
                  </div>
               )}
            </Card>

            {/* Add Measurement */}
            {!isCreating ? (
               <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => setIsCreating(true)}
               >
                  + Přidat měření
               </Button>
            ) : (
               <Card className="p-5">
                  <h2 className="text-lg font-bold mb-4">Nové měření</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">Váha (g)</label>
                        <input
                           type="number"
                           required
                           value={weight}
                           onChange={(e) => setWeight(e.target.value)}
                           className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
                           placeholder="Např. 4500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">Délka (cm)</label>
                        <input
                           type="number"
                           step="0.1"
                           required
                           value={height}
                           onChange={(e) => setHeight(e.target.value)}
                           className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
                           placeholder="Např. 56.5"
                        />
                     </div>
                     <div className="flex gap-3 pt-2">
                        <Button 
                           type="button" 
                           variant="secondary" 
                           className="flex-1"
                           onClick={() => setIsCreating(false)}
                        >
                           Zrušit
                        </Button>
                        <Button 
                           type="submit" 
                           variant="primary" 
                           className="flex-1"
                           loading={createMeasurement.isPending}
                        >
                           Uložit
                        </Button>
                     </div>
                  </form>
               </Card>
            )}

            {/* Measurements History List */}
            <div className="space-y-3">
               <h3 className="text-lg font-bold px-1 mt-8 mb-2">Historie</h3>
               {measurements?.map((m) => (
                  <Card key={m.id} className="p-4 flex items-center justify-between group">
                     <div>
                        <p className="font-semibold text-text-primary">{format(new Date(m.createdAt), 'd. MMMM yyyy', { locale: cs })}</p>
                        <p className="text-sm text-text-secondary">
                           {m.weight} g • {m.height} cm
                        </p>
                     </div>
                     <button 
                        onClick={() => {
                           if(confirm('Smazat měření?')) {
                              deleteMeasurement.mutate({ id: m.id })
                           }
                        }}
                        className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-2"
                     >
                        Smazat
                     </button>
                  </Card>
               ))}
               
               {measurements?.length === 0 && (
                  <p className="text-center text-text-muted py-8">Žádná historie</p>
               )}
            </div>

         </div>
      </div>
   )
}