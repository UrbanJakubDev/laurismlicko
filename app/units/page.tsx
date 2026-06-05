'use client'

import { useState } from 'react'
import { trpc } from '@/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'

export default function UnitsPage() {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  
  const utils = trpc.useUtils()
  const { data: units, isLoading } = trpc.food.listUnits.useQuery()
  
  const createUnit = trpc.food.createUnit.useMutation({
    onSuccess: () => {
      utils.food.listUnits.invalidate()
      setName('')
      setEmoji('')
      setIsCreating(false)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    createUnit.mutate({ name, emoji })
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
      <PageHeader title="Jednotky" subtitle="Nastavení" />

      <div className="p-4 space-y-6">
        
        {!isCreating ? (
          <Button 
            variant="primary" 
            className="w-full"
            onClick={() => setIsCreating(true)}
          >
            + Přidat jednotku
          </Button>
        ) : (
          <Card className="p-5">
            <h2 className="text-lg font-bold mb-4">Nová jednotka</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Zkratka / Název</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
                  placeholder="Např. ml"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Emoji</label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
                  placeholder="Např. 💧"
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
                  loading={createUnit.isPending}
                >
                  Uložit
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="space-y-3">
          {units?.map((unit) => (
            <Card key={unit.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-xl">
                  {unit.emoji || '📏'}
                </div>
                <h2 className="font-bold text-text-primary">{unit.name}</h2>
              </div>
            </Card>
          ))}
          
          {units?.length === 0 && (
            <p className="text-center text-text-muted py-8">Zatím žádné jednotky</p>
          )}
        </div>

      </div>
    </div>
  )
}