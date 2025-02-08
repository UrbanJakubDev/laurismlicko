import { prisma } from '@/lib/prisma'
import { SubmitButton } from '@/components/SubmitButton'
import { updateFood } from '@/app/actions'
import Link from 'next/link'


export default async function EditFoodPage({ params }: { params: { id: string } }) {

  const { id } = await params
  const food = await prisma.food.findUnique({
    where: { id: parseInt(id) },
    include: { unit: true }
  })

  const units = await prisma.unit.findMany()

  if (!food) {
    return <div>Food not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <Link href="/foods" className="text-baby-accent hover:text-baby-accent-dark">
          ← Back to Foods
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Edit {food.name}</h1>

      <form action={updateFood} className="space-y-4">
        <input type="hidden" name="id" value={food.id} />
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={food.name}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Emoji</label>
          <input
            type="text"
            name="emoji"
            defaultValue={food.emoji || ''}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Unit</label>
          <select
            name="unitId"
            defaultValue={food.unitId || ''}
            className="border p-2 rounded w-full"
          >
            <option value="">No unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} {unit.emoji}
              </option>
            ))}
          </select>
        </div>

        <SubmitButton>Save Changes</SubmitButton>
      </form>
    </div>
  )
}
