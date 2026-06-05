'use client'

import { use } from 'react'
import { trpc } from '@/trpc/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { FeedSection } from '@/components/feed/FeedSection'

export default function FeedingsPage({
   params,
}: {
   params: Promise<{ id: string }>
}) {
   const { id } = use(params)
   const babyId = parseInt(id)

   const { data: baby } = trpc.baby.getById.useQuery({ id: babyId })

   return (
      <div className="min-h-screen safe-area-top safe-area-bottom pb-20 bg-bg-primary">
         <PageHeader title="Historie krmení" subtitle={baby?.name} />

         <div className="p-4">
            <FeedSection babyId={babyId} />
         </div>
      </div>
   )
}
