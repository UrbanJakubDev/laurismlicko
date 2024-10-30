// app/actions.ts
'use server'
import { prisma } from '@/lib/prisma'
import { time } from 'console'
import { formatInTimeZone } from 'date-fns-tz'
import { revalidatePath } from 'next/cache'

const FEEDS_PER_DAY = 8
const MILK_FACTOR = 170 // ml per kg



export async function createBaby(formData: FormData) {
  const name = formData.get('name') as string
  const birthday = new Date(formData.get('birthday') as string)

  await prisma.baby.create({
    data: { name, birthday }
  })
  revalidatePath('/babies')
}

export async function createMeasurement(formData: FormData) {
  const babyId = parseInt(formData.get('babyId') as string)
  const weight = parseInt(formData.get('weight') as string) // in grams
  const height = parseFloat(formData.get('height') as string)

  // Calculate daily milk amount based on weight
  const dailyMilkAmount = Math.round((weight / 1000) * MILK_FACTOR)
  const averageFeedAmount = Math.round(dailyMilkAmount / FEEDS_PER_DAY)

  await prisma.babyMeasurement.create({
    data: {
      babyId,
      weight,
      height,
      dailyMilkAmount,
      feedsPerDay: FEEDS_PER_DAY,
      averageFeedAmount
    }
  })
  revalidatePath(`/babies/${babyId}`)
}

export async function createFeed(formData: FormData) {
  const babyId = parseInt(formData.get('babyId') as string)
  const feedTime = new Date(formData.get('feedTime') as string)
  const amount = parseInt(formData.get('amount') as string)




  await prisma.feed.create({
    data: {
      babyId,
      feedTime: feedTime.toISOString(),
      amount
    }
  })
  revalidatePath(`/babies/${babyId}`)
}

// Helper function to get feed statistics
export async function getFeedStats(babyId: number, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const feeds = await prisma.feed.findMany({
    where: {
      babyId,
      feedTime: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: { feedTime: 'asc' }
  })

  const latestMeasurement = await prisma.babyMeasurement.findFirst({
    where: { babyId },
    orderBy: { createdAt: 'desc' }
  })

  // Helper function to format minutes to HH:mm
  const formatTimeInterval = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Helper function to get current time with timezone correction
  const getCurrentTime = (): Date => {
    const now = new Date()
    // Add one hour to correct for timezone difference
    now.setHours(now.getHours() + 1)
    return now
  }

  // Helper function to calculate time difference
  const getTimeDifferenceInMinutes = (laterDate: Date, earlierDate: Date): number => {
    return Math.round((laterDate.getTime() - earlierDate.getTime()) / (1000 * 60))
  }

  // Add time differences between feeds
  const feedsWithTimeDiff = feeds.map((feed, index) => {
    let timeDiffString = null
    if (index > 0) {
      const currentFeedTime = new Date(feed.feedTime)
      const previousFeedTime = new Date(feeds[index - 1].feedTime)
      const diffMinutes = getTimeDifferenceInMinutes(currentFeedTime, previousFeedTime)
      timeDiffString = formatTimeInterval(diffMinutes)
    }
    return {
      ...feed,
      timeSinceLastFeed: timeDiffString
    }
  })

  const totalMilk = feeds.reduce((sum, feed) => sum + feed.amount, 0)
  const feedCount = feeds.length
  const targetMilk = latestMeasurement?.dailyMilkAmount ?? 0
  const remainingMilk = targetMilk - totalMilk
  const remainingFeeds = FEEDS_PER_DAY - feedCount
  const averageAmount = feedCount > 0 ? Math.round(totalMilk / feedCount) : 0

  // Calculate time since last feed with timezone correction
  const lastFeedTime = feeds[feeds.length - 1]?.feedTime
  let timeSinceLastFeed = null
  if (lastFeedTime) {
    const now = getCurrentTime() // Get current time with timezone correction
    const lastFeedDate = new Date(lastFeedTime)
    const diffMinutes = getTimeDifferenceInMinutes(now, lastFeedDate)
    timeSinceLastFeed = formatTimeInterval(diffMinutes)
  }

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
    recommendedNextAmount: remainingFeeds > 0 ? Math.round(remainingMilk / remainingFeeds) : 0
  }
}

export async function createPoop(formData: FormData) {
  const babyId = parseInt(formData.get('babyId') as string)
  const poopTimeLocal = new Date(formData.get('poopTime') as string)
  const color = formData.get('color') as string
  const consistency = formData.get('consistency') as string
  const amount = parseInt(formData.get('amount') as string)

  await prisma.poop.create({
    data: {
      babyId,
      poopTime: poopTimeLocal.toISOString(),
      color,
      consistency,
      amount
    }
  })
  revalidatePath(`/babies/${babyId}`)
}


export async function deleteMeasurement(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  const babyId = parseInt(formData.get('babyId') as string)
  await prisma.babyMeasurement.delete({ where: { id } })
  revalidatePath(`/babies/${babyId}`)
}

export async function deleteFeed(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  const babyId = parseInt(formData.get('babyId') as string)
  await prisma.feed.delete({ where: { id } })
  revalidatePath(`/babies/${babyId}`)
}

export async function deletePoop(formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  const babyId = parseInt(formData.get('babyId') as string)
  await prisma.poop.delete({ where: { id } })
  revalidatePath(`/babies/${babyId}`)
}