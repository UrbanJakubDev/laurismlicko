import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

const MILK_AMOUNT_PER_KG = 150
const FEEDS_PER_DAY = 6

function calculateMilkAmounts(weight: number) {
  const dailyMilkAmount = Math.round((weight / 1000) * MILK_AMOUNT_PER_KG)

  return {
    dailyMilkAmount,
    feedsPerDay: FEEDS_PER_DAY,
    averageFeedAmount: Math.round(dailyMilkAmount / FEEDS_PER_DAY),
  }
}

export const measurementRouter = router({
  list: publicProcedure
    .input(z.object({
      babyId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.babyMeasurement.findMany({
        where: { babyId: input.babyId },
        orderBy: { createdAt: 'desc' },
      })
    }),

  create: publicProcedure
    .input(z.object({
      babyId: z.number(),
      weight: z.number().min(0),
      height: z.number().min(0),
      // Mléko na dávku (150ml na 1kg váhy)
      // dailyMilkAmount = weight / 1000 * 150
      // averageFeedAmount = dailyMilkAmount / targetFeeds (usually 6-8, let's use 6 as base or just calculate from weight)
    }))
    .mutation(async ({ ctx, input }) => {
      const milkAmounts = calculateMilkAmounts(input.weight)

      return ctx.prisma.babyMeasurement.create({
        data: {
          babyId: input.babyId,
          weight: input.weight,
          height: input.height,
          ...milkAmounts,
        },
      })
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      weight: z.number().min(0),
      height: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const milkAmounts = calculateMilkAmounts(input.weight)

      return ctx.prisma.babyMeasurement.update({
        where: { id: input.id },
        data: {
          weight: input.weight,
          height: input.height,
          ...milkAmounts,
        },
      })
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.babyMeasurement.delete({
        where: { id: input.id },
      })
    }),
})
