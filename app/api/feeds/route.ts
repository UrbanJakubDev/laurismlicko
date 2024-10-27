// app/api/feeds/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const babyId = searchParams.get('babyId')
  const dateStr = searchParams.get('date')

  if (!babyId || !dateStr) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  // Convert local date to UTC for database query
  const localDate = new Date(dateStr)
  const startDate = startOfDay(localDate)
  const endDate = endOfDay(localDate)

  const feeds = await prisma.feed.findMany({
    where: {
      babyId: parseInt(babyId),
      feedTime: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { feedTime: 'desc' }
  })

  const latestMeasurement = await prisma.babyMeasurement.findFirst({
    where: { babyId: parseInt(babyId) },
    orderBy: { createdAt: 'desc' }
  })

  const totalMilk = feeds.reduce((sum, feed) => sum + feed.amount, 0)
  const feedCount = feeds.length
  const targetMilk = latestMeasurement?.dailyMilkAmount ?? 0
  const remainingMilk = targetMilk - totalMilk
  const remainingFeeds = 8 - feedCount
  const averageAmount = feedCount > 0 ? Math.round(totalMilk / feedCount) : 0

  return NextResponse.json({
    feeds,
    totalMilk,
    feedCount,
    targetMilk,
    remainingMilk,
    remainingFeeds,
    averageAmount,
    recommendedNextAmount: remainingFeeds > 0 ? Math.round(remainingMilk / remainingFeeds) : 0
  })
}