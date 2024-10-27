import Link from 'next/link'
import { createBaby } from './actions'
import { prisma } from '@/lib/prisma'
import { SubmitButton } from '@/components/SubmitButton'

export default async function Home() {
  const babies = await prisma.baby.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Baby Tracker</h1>
      
      <form action={createBaby} className="mb-8 space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Birthday</label>
          <input
            type="date"
            name="birthday"
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <SubmitButton>Create Baby</SubmitButton>
      </form>

      <div className="space-y-4">
        {babies.map((baby) => (
          <div key={baby.id} className="border p-4 rounded">
            <Link href={`/babies/${baby.id}`}>
              <h2 className="text-xl font-semibold">{baby.name}</h2>
              <p>Birthday: {baby.birthday.toLocaleDateString()}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}