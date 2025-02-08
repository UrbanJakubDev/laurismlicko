import { prisma } from "@/lib/prisma"
import { createUnit } from "../actions"
import { SubmitButton } from "@/components/SubmitButton"
export default async function UnitsPage() {
    const units = await prisma.unit.findMany()

    return (
        <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Units</h1>

                <form action={createUnit} className="mb-8 space-y-4">
                    <div>
                        <label htmlFor="name" className="block mb-1">Name</label>
                        <input type="text" name="name" className="border p-2 rounded w-full" />
                    </div>
                    <div>
                        <label htmlFor="emoji" className="block mb-1">Emoji</label>
                        <input type="text" name="emoji" className="border p-2 rounded w-full" />
                    </div>
                    <SubmitButton>Create</SubmitButton>
                </form>

                <ul>
                    {units.map((unit) => (
                        <li key={unit.id}>{unit.name} {unit.emoji}</li>
                    ))}
                </ul>
            </div>
    )
}