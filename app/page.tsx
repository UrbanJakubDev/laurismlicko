'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/trpc/client'
import { useBaby } from '@/components/providers/BabyProvider'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const { setSelectedBabyId } = useBaby()
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBirthday, setNewBirthday] = useState('')

  const { data: babies, isLoading, refetch } = trpc.baby.list.useQuery()
  const createBaby = trpc.baby.create.useMutation({
    onSuccess: () => {
      setIsCreating(false)
      setNewName('')
      setNewBirthday('')
      refetch()
    }
  })



  const handleSelect = (id: number) => {
    setSelectedBabyId(id.toString())
    router.push(`/babies/${id}`)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newBirthday) return
    createBaby.mutate({ name: newName, birthday: newBirthday })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen safe-area-top safe-area-bottom pb-20">
      <PageHeader title="MíšaMlíčko" subtitle="Vyberte profil" />
      
      <div className="p-4 space-y-4">
        {babies?.map((baby) => (
          <motion.div
            key={baby.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(baby.id)}
          >
            <Card variant="elevated" className="p-6 cursor-pointer hover:border-accent-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center text-3xl">
                  👶
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{baby.name}</h2>
                  <p className="text-text-secondary">
                    Narozen: {new Date(baby.birthday).toLocaleDateString('cs-CZ')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {!isCreating ? (
          <Button 
            variant="ghost" 
            className="w-full mt-8"
            onClick={() => setIsCreating(true)}
          >
            + Přidat další profil
          </Button>
        ) : (
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-bold mb-4">Nový profil</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Jméno</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bg-elevated border-none focus:ring-2 focus:ring-accent-primary outline-none"
                  placeholder="Např. Míša"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Datum narození</label>
                <input
                  type="date"
                  required
                  value={newBirthday}
                  onChange={(e) => setNewBirthday(e.target.value)}
                  className="w-full p-3 rounded-xl bg-bg-elevated border-none focus:ring-2 focus:ring-accent-primary outline-none"
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
                  loading={createBaby.isPending}
                >
                  Uložit
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}