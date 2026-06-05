// server/routers/food.ts
import { z } from 'zod'
import { router, publicProcedure } from '../trpc'

export const foodRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.food.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        unit: true,
      },
    })
  }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.food.create({
        data: { name: input.name },
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        emoji: z.string().optional(),
        unitId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.food.update({
        where: { id: input.id },
        data: {
          name: input.name,
          emoji: input.emoji,
          unitId: input.unitId,
        },
      })
    }),

  listUnits: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.unit.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }),

  createUnit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        emoji: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.unit.create({
        data: {
          name: input.name,
          emoji: input.emoji,
        },
      })
    }),
})
