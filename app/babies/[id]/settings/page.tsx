'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/trpc/client'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/layout/PageHeader'
import { usePin } from '@/context/PinContext'
import { useBaby } from '@/components/providers/BabyProvider'
import { usePush } from '@/components/providers/PushProvider'
import { FaCircleUser, FaLock, FaBell } from 'react-icons/fa6'

export default function SettingsPage({
   params,
}: {
   params: Promise<{ id: string }>
}) {
   const { id } = use(params)
   const babyId = parseInt(id)
   const router = useRouter()
   
   const { logout } = usePin()
   const { setSelectedBabyId } = useBaby()
   const { isSupported, isSubscribed, subscribe, subscription } = usePush()
   const scheduleNotification = trpc.feed.scheduleNotification.useMutation()

   const handleTestNotification = async () => {
      if (!isSupported) {
         alert('Push notifikace nejsou na tomto zařízení podporovány. Přidejte si aplikaci na plochu (Add to Home Screen).')
         return
      }
      let sub = subscription
      if (!isSubscribed) {
         sub = await subscribe()
      }
      if (sub) {
         scheduleNotification.mutate({
            subscription: sub,
            delayString: '30s',
            title: '🧪 Testovací notifikace',
            message: 'Tato notifikace přišla s 30s zpožděním přes QStash!'
         }, {
            onSuccess: () => alert('Odesláno! Notifikace přijde za cca 30 sekund.'),
            onError: (err) => alert('Chyba: ' + err.message)
         })
      }
   }

   const { data: baby, isLoading } = trpc.baby.getById.useQuery({ id: babyId })

   if (isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
         </div>
      )
   }

   return (
      <div className="min-h-screen safe-area-top safe-area-bottom pb-20 bg-bg-primary">
         <PageHeader title="Nastavení" subtitle={baby?.name} />

         <div className="p-4 space-y-6">
            
            <div className="flex flex-col items-center py-6">
               <div className="w-24 h-24 rounded-full bg-accent-primary/10 flex items-center justify-center text-4xl text-accent-primary mb-4">
                  <FaCircleUser />
               </div>
               <h2 className="text-2xl font-bold text-text-primary">{baby?.name}</h2>
               <p className="text-text-secondary">
                  {baby ? new Date(baby.birthday).toLocaleDateString('cs-CZ') : ''}
               </p>
            </div>

            <Card className="overflow-hidden">
               <div className="divide-y divide-bg-elevated">
                  <button 
                     onClick={() => router.push('/foods')}
                     className="w-full flex items-center justify-between p-4 bg-bg-card hover:bg-bg-elevated transition-colors active:scale-100"
                  >
                     <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
                           🍽️
                        </span>
                        <span className="font-semibold text-text-primary">Správa jídla a jednotek</span>
                     </div>
                     <span className="text-text-muted">→</span>
                  </button>

                  <button 
                     onClick={() => {
                        setSelectedBabyId(null)
                        router.push('/')
                     }}
                     className="w-full flex items-center justify-between p-4 bg-bg-card hover:bg-bg-elevated transition-colors active:scale-100"
                  >
                     <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-accent-warning/10 flex items-center justify-center text-accent-warning">
                           👶
                        </span>
                        <span className="font-semibold text-text-primary">Změnit dítě</span>
                     </div>
                     <span className="text-text-muted">→</span>
                  </button>
               </div>
            </Card>

            <Card className="overflow-hidden">
               <button 
                  onClick={handleTestNotification}
                  disabled={scheduleNotification.isPending}
                  className="w-full flex items-center justify-between p-4 bg-bg-card hover:bg-accent-success/5 transition-colors active:scale-100"
               >
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-accent-success/10 flex items-center justify-center text-accent-success">
                        <FaBell />
                     </span>
                     <span className="font-bold text-accent-success">
                        {scheduleNotification.isPending ? 'Odesílám...' : 'Odeslat testovací notifikaci (za 30s)'}
                     </span>
                  </div>
               </button>
               <button 
                  onClick={logout}
                  className="w-full flex items-center justify-between p-4 bg-bg-card hover:bg-error/5 transition-colors active:scale-100 border-t border-bg-elevated"
               >
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
                        <FaLock />
                     </span>
                     <span className="font-bold text-error">Zamknout aplikaci (PIN)</span>
                  </div>
               </button>
            </Card>
            
            <p className="text-center text-sm text-text-muted pt-8">
               Verze 2.0 (PWA & tRPC)
            </p>
         </div>
      </div>
   )
}
