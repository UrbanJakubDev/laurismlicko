'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'

export default function EditFoodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const foodId = parseInt(id)
  const router = useRouter()

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [unitId, setUnitId] = useState<number | ''>('')

  const utils = trpc.useUtils()
  const { data: foods, isLoading: isLoadingFoods } = trpc.food.list.useQuery()
  const { data: units, isLoading: isLoadingUnits } = trpc.food.listUnits.useQuery()
  
  const updateFood = trpc.food.update.useMutation({
    onSuccess: () => {
      utils.food.list.invalidate()
      router.push('/foods')
    }
  })

  useEffect(() => {
    if (foods) {
      const food = foods.find(f => f.id === foodId)
      if (food) {
        setName(food.name)
        setEmoji(food.emoji || '')
        setUnitId(food.unitId || '')
      }
    }
  }, [foods, foodId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || unitId === '') return
    updateFood.mutate({ 
      id: foodId, 
      name, 
      emoji, 
      unitId: Number(unitId) 
    })
  }

  if (isLoadingFoods || isLoadingUnits) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen safe-area-top safe-area-bottom bg-bg-primary">
      <PageHeader 
        title="Úprava jídla" 
        subtitle="Nastavení"
        backHref="/foods"
      />

      <div className="p-4">
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Název</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Jednotka</label>
              <select
                required
                value={unitId}
                onChange={(e) => setUnitId(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-bg-elevated text-text-primary border-none focus:ring-2 focus:ring-accent-primary outline-none"
              >
                <option value="" disabled>Vyberte jednotku</option>
                {units?.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} {unit.emoji}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full"
                loading={updateFood.isPending}
              >
                Uložit změny
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
