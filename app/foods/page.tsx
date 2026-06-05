'use client'

import { useState } from 'react'
import { trpc } from '@/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import Link from 'next/link'

export default function FoodsPage() {
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  
  const utils = trpc.useUtils()
  const { data: foods, isLoading } = trpc.food.list.useQuery()
  
  const createFood = trpc.food.create.useMutation({
    onSuccess: () => {
      utils.food.list.invalidate()
      setName('')
      setIsCreating(false)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    createFood.mutate({ name })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen safe-area-top safe-area-bottom pb-20 bg-bg-primary">
      <PageHeader title="Příkrmy a Mléko" subtitle="Nastavení jídla" />

      <div className="p-4 space-y-6">
        
        {!isCreating ? (
          <Button 
            variant="primary" 
            className="w-full"
            onClick={() => setIsCreating(true)}
          >
            + Přidat jídlo
          </Button>
        ) : (
          <Card className="p-5">
            <h2 className="text-lg font-bold mb-4">Nové jídlo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Název</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
                  placeholder="Např. Přesnídávka"
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
                  loading={createFood.isPending}
                >
                  Uložit
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="space-y-3">
          {foods?.map((food) => (
            <Card key={food.id} className="p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-xl">
                  {food.emoji || '🍽️'}
                </div>
                <div>
                  <h2 className="font-bold text-text-primary">{food.name}</h2>
                  <p className="text-sm text-text-secondary">
                    {food.unit ? `${food.unit.name} ${food.unit.emoji || ''}` : 'Bez jednotky'}
                  </p>
                </div>
              </div>
              <Link 
                href={`/foods/${food.id}`} 
                className="text-sm font-bold text-accent-primary px-3 py-1.5 bg-accent-primary/10 rounded-lg hover:bg-accent-primary/20 transition-colors"
              >
                Upravit
              </Link>
            </Card>
          ))}
          
          {foods?.length === 0 && (
            <p className="text-center text-text-muted py-8">Zatím žádné jídlo</p>
          )}
        </div>

      </div>
    </div>
  )
}