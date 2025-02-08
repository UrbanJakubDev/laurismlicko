import { prisma } from '@/lib/prisma'
import { createFood } from '../actions'
import { SubmitButton } from '@/components/SubmitButton'
import Link from 'next/link'

export default async function FoodsPage() {
  const foods = await prisma.food.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-4xl mx-auto p-4">
      
      <h1 className="text-2xl font-bold mb-4">Foods</h1>
      
      <form action={createFood} className="mb-8 space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <SubmitButton>Add Food</SubmitButton>
      </form>

      <div className="space-y-4">
        {foods.map((food) => (
          <div key={food.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{food.name}</h2>
            <p className="text-gray-500">Added: {food.createdAt.toLocaleDateString()}</p>
            <p className="text-gray-500">Unit: {food.unit?.name} {food.unit?.emoji}</p>
            <p className="text-gray-500">Emoji: {food.emoji}</p>

            <Link href={`/foods/${food.id}/`} className="text-baby-accent hover:text-baby-soft transition-colors">
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
} 