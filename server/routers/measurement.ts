import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

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
      const dailyMilkAmount = (input.weight / 1000) * 150
      const averageFeedAmount = dailyMilkAmount / 6

      return ctx.prisma.babyMeasurement.create({
        data: {
          babyId: input.babyId,
          weight: input.weight,
          height: input.height,
          dailyMilkAmount,
          averageFeedAmount,
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
