// server/routers/feed.ts
import { z } from 'zod'
import { router, publicProcedure } from '../trpc'

const FEEDS_PER_DAY = 10
const formatTimeInterval = (minutes: number) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mins = String(minutes % 60).padStart(2, '0')
  return `${hours}:${mins}`
}

const getTimeDifferenceInMinutes = (laterDate: Date, earlierDate: Date) =>
  Math.round((laterDate.getTime() - earlierDate.getTime()) / (1000 * 60))

export const feedRouter = router({
  getStats: publicProcedure
    .input(
      z.object({
        babyId: z.number(),
        date: z.string(),
        timezone: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { babyId, date, timezone } = input

      // Převod data na začátek a konec dne v dané časové zóně
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        throw new Error('Neplatný formát data')
      }

      // Výpočet UTC offsetu pro danou časovou zónu a den
      const dayString = date.split('T')[0] // YYYY-MM-DD
      const utcMidnight = new Date(`${dayString}T00:00:00`)
      const localMidnight = new Date(
        utcMidnight.toLocaleString('en-US', { timeZone: timezone })
      )
      const offsetMs = localMidnight.getTime() - utcMidnight.getTime()

      const queryStart = new Date(
        new Date(`${dayString}T00:00:00.000Z`).getTime() - offsetMs
      )
      const queryEnd = new Date(
        new Date(`${dayString}T23:59:59.999Z`).getTime() - offsetMs
      )

      const feeds = await ctx.prisma.feed.findMany({
        where: {
          babyId,
          feedTime: {
            gte: queryStart,
            lt: queryEnd,
          },
        },
        orderBy: { feedTime: 'asc' },
        include: {
          food: {
            select: {
              name: true,
              emoji: true,
              unit: {
                select: {
                  name: true,
                  emoji: true,
                },
              },
            },
          },
        },
      })

      const latestMeasurement = await ctx.prisma.babyMeasurement.findFirst({
        where: { babyId },
        orderBy: { createdAt: 'desc' },
      })

      const now = new Date()

      // Časové rozdíly mezi krmením
      const feedsWithTimeDiff = feeds.map((feed, index) => {
        const timeDiffString =
          index > 0
            ? formatTimeInterval(
                getTimeDifferenceInMinutes(feed.feedTime, feeds[index - 1].feedTime)
              )
            : null

        return {
          ...feed,
          timeSinceLastFeed: timeDiffString,
        }
      })

      const totalMilk = feeds.reduce((sum, feed) => sum + feed.amount, 0)
      const feedCount = feeds.length
      const targetMilk = latestMeasurement?.dailyMilkAmount ?? 0
      const remainingMilk = targetMilk - totalMilk
      const remainingFeeds = FEEDS_PER_DAY - feedCount
      const averageAmount =
        feedCount > 0 ? Math.round(totalMilk / feedCount) : 0

      const lastFeed = feeds.filter((feed) => feed.type === 'main').pop()
      const lastFeedTime = lastFeed ? lastFeed.feedTime : null

      // Čas od posledního krmení
      const timeSinceLastFeed = lastFeedTime
        ? formatTimeInterval(getTimeDifferenceInMinutes(now, lastFeedTime))
        : null

      return {
        feeds: feedsWithTimeDiff,
        totalMilk,
        feedCount,
        targetMilk,
        remainingMilk,
        remainingFeeds,
        averageAmount,
        lastFeedTime,
        timeSinceLastFeed,
        recommendedNextAmount:
          remainingFeeds > 0 ? Math.round(remainingMilk / remainingFeeds) : 0,
        feedsPerDay: FEEDS_PER_DAY,
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        babyId: z.number(),
        feedTime: z.string(),
        amount: z.number(),
        type: z.enum(['main', 'additional']),
        foodId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const feedTime = new Date(input.feedTime)

      if (isNaN(feedTime.getTime())) {
        throw new Error('Neplatný čas krmení')
      }

      return ctx.prisma.feed.create({
        data: {
          babyId: input.babyId,
          feedTime,
          amount: input.amount,
          type: input.type,
          foodId: input.foodId,
        },
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        feedTime: z.string(),
        amount: z.number(),
        type: z.enum(['main', 'additional']),
        foodId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const feedTime = new Date(input.feedTime)

      if (isNaN(feedTime.getTime())) {
        throw new Error('Neplatný čas krmení')
      }

      return ctx.prisma.feed.update({
        where: { id: input.id },
        data: {
          feedTime,
          amount: input.amount,
          type: input.type,
          foodId: input.foodId,
        },
      })
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.feed.delete({ where: { id: input.id } })
    }),
  scheduleNotification: publicProcedure
    .input(z.object({
      subscription: z.any(), // PushSubscription
      delayMinutes: z.number().optional(),
      delayString: z.string().optional(),
      title: z.string(),
      message: z.string()
    }))
    .mutation(async ({ input }) => {
      const { Client } = await import('@upstash/qstash');
      
      const qstash = new Client({
        token: process.env.QSTASH_TOKEN || '',
      });

      // Získání base URL pro produkci nebo dev
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
        
      if (!baseUrl) {
        throw new Error('Chybí base URL pro QStash. Nastav NEXT_PUBLIC_SITE_URL v .env na tvůj ngrok tunel.');
      }

      try {
        const res = await qstash.publishJSON({
          url: `${baseUrl}/api/notify`,
          body: {
            subscription: input.subscription,
            title: input.title,
            message: input.message,
          },
          delay: input.delayString || `${input.delayMinutes}m`,
        });
        return { success: true, messageId: res.messageId };
      } catch (error) {
        console.error('QStash Error:', error);
        throw new Error('Failed to schedule notification');
      }
    })
})
