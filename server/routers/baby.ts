// server/routers/baby.ts
import { z } from 'zod'
import { router, publicProcedure } from '../trpc'

const FEEDS_PER_DAY = 10
const MILK_FACTOR = 170 // ml na kg

export const babyRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.baby.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.baby.findUnique({
        where: { id: input.id },
        include: {
          measurements: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          feeds: {
            orderBy: { feedTime: 'desc' },
          },
        },
      })
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        birthday: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const birthday = new Date(input.birthday)
      return ctx.prisma.baby.create({
        data: { name: input.name, birthday },
      })
    }),

  createMeasurement: publicProcedure
    .input(
      z.object({
        babyId: z.number(),
        weight: z.number(), // v gramech
        height: z.number(), // v cm
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dailyMilkAmount = Math.round((input.weight / 1000) * MILK_FACTOR)
      const averageFeedAmount = Math.round(dailyMilkAmount / FEEDS_PER_DAY)

      return ctx.prisma.babyMeasurement.create({
        data: {
          babyId: input.babyId,
          weight: input.weight,
          height: input.height,
          dailyMilkAmount,
          feedsPerDay: FEEDS_PER_DAY,
          averageFeedAmount,
        },
      })
    }),

  deleteMeasurement: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.babyMeasurement.delete({
        where: { id: input.id },
      })
    }),

  getMeasurements: publicProcedure
    .input(z.object({ babyId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.babyMeasurement.findMany({
        where: { babyId: input.babyId },
        orderBy: { createdAt: 'desc' },
      })
    }),
})
