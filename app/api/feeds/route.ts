import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// app/api/feeds/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const babyId = searchParams.get('babyId')
  const dateStr = searchParams.get('date')

  if (!babyId || !dateStr) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const localDate = new Date(dateStr)
  const startDate = new Date(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    0, 0, 0
  )
  const endDate = new Date(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    23, 59, 59
  )

  // Convert to UTC for database query
  const utcStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
  const utcEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)

  const feeds = await prisma.feed.findMany({
    where: {
      babyId: parseInt(babyId),
      feedTime: {
        gte: utcStartDate,
        lte: utcEndDate
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