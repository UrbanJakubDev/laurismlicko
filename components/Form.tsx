"use client"
import { createFeed } from "@/app/actions"
import { SubmitButton } from "./SubmitButton"
import { formatInTimeZone } from "date-fns-tz"
import { Baby, Food } from "@prisma/client"
import * as yup from "yup"
import { useForm } from '@tanstack/react-form'
import { useCallback, useState } from "react"

type Props = {
    baby: Baby
    stats: {
        averageAmount: number
        remainingMilk: number
    }
    foods: Food[]
}

// Form validation schema
const schema = yup.object().shape({
    feedTime: yup.string().required('Čas krmení je povinný'),
    amount: yup.number()
        .required('Množství je povinné')
        .positive('Množství musí být větší než 0'),
    type: yup.string()
        .required('Typ krmení je povinný')
        .oneOf(['main', 'additional'], 'Neplatný typ krmení'),
    foodId: yup.number().required('Vyberte jídlo'),
})

type FormValues = {
    babyId: number
    feedTime: string
    amount: number
    type: 'main' | 'additional'
    foodId: number
}

export function AddFeedForm({ baby, stats, foods }: Props) {
    const [serverErrors, setServerErrors] = useState<string[]>([])

    // Get current time in Prague timezone formatted for datetime-local input
    const currentTime = formatInTimeZone(new Date(), 'Europe/Prague', "yyyy-MM-dd'T'HH:mm")
    const defaultAmount = stats.averageAmount >= stats.remainingMilk ? stats.remainingMilk : stats.averageAmount

    // Sort foods to put milk (id: 4) first
    const sortedFoods = [...foods].sort((a, b) => {
        if (a.id === 4) return -1;
        if (b.id === 4) return 1;
        return 0;
    });

    const defaultFoodId = 4;

    const form = useForm<FormValues>({
        defaultValues: {
            feedTime: currentTime,
            amount: defaultAmount,
            type: 'main' as const,
            foodId: defaultFoodId
        },
        onSubmit: useCallback(async (value: FormValues) => {
            try {
                // Validate with Yup
                await schema.validate(value)

                // Add babyId to the submission data
                const submissionData = {
                    ...value,
                    babyId: baby.id
                }

                // Submit using server action
                await createFeed(submissionData)


                form.reset()
            } catch (error) {
                if (error instanceof yup.ValidationError) {
                    setServerErrors([error.message])
                } else {
                    setServerErrors(['Došlo k neočekávané chybě'])
                }
            }
        }, [baby.id])
    })

    return (
        <>
            <div className="text-lg font-semibold text-baby-accent mt-6 mb-2">
                Přidat krmení
            </div>
            <div className="bg-cardbg rounded-lg shadow-md p-6">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-4"
                >
                    {/* Show server errors if any */}
                    {serverErrors.length > 0 && (
                        <div className="text-red-500 text-sm">
                            <p>Nastala chyba při ukládání krmení na serveru:</p>
                            {serverErrors.map((error, i) => (
                                <p key={i}>{error}</p>
                            ))}
                        </div>
                    )}

                    <form.Field
                        name="feedTime"
                        validators={{
                            onChange: ({ value }) => {
                                try {
                                    schema.validateSyncAt('feedTime', { feedTime: value })
                                } catch (error) {
                                    return (error as yup.ValidationError).message
                                }
                            }
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <label className="block text-sm text-baby-soft">
                                    Čas krmení
                                </label>
                                <input
                                    type="datetime-local"
                                    value={field.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    defaultValue={currentTime}
                                    className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                                />
                                {field.state.meta.errors && (
                                    <em className="text-red-500 text-sm">{field.state.meta.errors.join(', ')}</em>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field
                        name="amount"
                        validators={{
                            onChange: ({ value }) => {
                                try {
                                    schema.validateSyncAt('amount', { amount: value })
                                } catch (error) {
                                    return (error as yup.ValidationError).message
                                }
                            }
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <label className="block text-sm text-baby-soft">
                                    Množství (ml)
                                </label>
                                <input
                                    type="number"
                                    value={field.value}
                                    defaultValue={defaultAmount}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                                />
                                {field.state.meta.errors && (
                                    <em className="text-red-500 text-sm">{field.state.meta.errors.join(', ')}</em>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field
                        name="type"
                        validators={{
                            onChange: ({ value }) => {
                                try {
                                    schema.validateSyncAt('type', { type: value })
                                } catch (error) {
                                    return (error as yup.ValidationError).message
                                }
                            }
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <label className="block text-sm text-baby-soft">
                                    Typ krmení
                                </label>
                                <select
                                    value={field.value}
                                    defaultValue="main"
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                                >
                                    <option value="main">Hlavní</option>
                                    <option value="additional">Doplňkové</option>
                                </select>
                                {field.state.meta.errors && (
                                    <em className="text-red-500 text-sm">{field.state.meta.errors.join(', ')}</em>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field
                        name="foodId"
                        validators={{
                            onChange: ({ value }) => {
                                try {
                                    schema.validateSyncAt('foodId', { foodId: value })
                                } catch (error) {
                                    return (error as yup.ValidationError).message
                                }
                            }
                        }}
                    >
                        {(field) => (
                            <div className="space-y-2">
                                <label className="block text-sm text-baby-soft">
                                    Jídlo
                                </label>
                                <select
                                    defaultValue={defaultFoodId}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10)
                                        field.handleChange(value)
                                    }}
                                    className="w-full p-3 border border-baby-pink/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-baby-accent/50"
                                >
                                    {sortedFoods.map(food => (
                                        <option key={food.id} value={food.id}>
                                            {food.emoji} {food.name}
                                        </option>
                                    ))}
                                </select>
                                {field.state.meta.errors && (
                                    <em className="text-red-500 text-sm">
                                        {field.state.meta.errors.join(', ')}
                                    </em>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Subscribe
                        selector={(state) => state.isSubmitting}
                    >
                        {(isSubmitting) => (
                            <SubmitButton isSubmitting={isSubmitting}>
                                {isSubmitting ? 'Ukládám...' : 'Přidat krmení'}
                            </SubmitButton>
                        )}
                    </form.Subscribe>
                </form>
            </div>
        </>
    )
}
