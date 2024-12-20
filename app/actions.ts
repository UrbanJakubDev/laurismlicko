// app/actions.ts
'use server'
import { prisma } from '@/lib/prisma'
import { Feed } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { startOfDay, endOfDay } from 'date-fns';

const FEEDS_PER_DAY = 10
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

/**
 * Create a new feed entry.
 *
 * @param {Object} opts
 * @prop {string} babyId - the ID of the baby
 * @prop {string} feedTime - the time of the feed in ISO string format
 * @prop {string} amount - the amount of milk in ml
 * @prop {string} type - either 'main' or 'additional'
 *
 * @throws {Error} if any of the input values are invalid
 */
export async function createFeed(formData: FormData) {
  const babyIdNum = parseInt(formData.get('babyId') as string)
  const feedTimeStr = formData.get('feedTime') as string
  const amountStr = formData.get('amount') as string
  const feedTime = new Date(feedTimeStr)
  const amount = parseInt(amountStr, 10)
  const type = formData.get('type') as Feed['type']

  console.log(babyIdNum, feedTime, amount, type)

  if (isNaN(babyIdNum) || isNaN(amount) || isNaN(feedTime.getTime())) {
    throw new Error('Invalid input')
  }

  await prisma.feed.create({
    data: {
      babyId: babyIdNum,
      feedTime: feedTime.toISOString(),
      amount,
      type
    }
  })
  revalidatePath(`/babies/${babyIdNum}`)
}

// Helper function to get feed statistics
export async function getFeedStats(babyId: number, date: Date) {
  // Create start and end of day in the same timezone as stored in DB (GMT+0100)
  const start = startOfDay(date);
  const end = endOfDay(date);
  
  // Adjust for timezone offset
  start.setHours(start.getHours() + 1);
  end.setHours(end.getHours() + 1);

  const feeds = await prisma.feed.findMany({
    where: {
      babyId,
      feedTime: {
        gte: start,
        lt: end
      }
    },
    orderBy: { feedTime: 'asc' },
  }) as Feed[];

  

  // ... rest of the function remains unchanged

  const latestMeasurement = await prisma.babyMeasurement.findFirst({
    where: { babyId },
    orderBy: { createdAt: 'desc' },
  });

  const formatTimeInterval = (minutes: number) => {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Adjust for timezone
    return now;
  };

  const getTimeDifferenceInMinutes = (laterDate: Date, earlierDate: Date) =>
    Math.round((laterDate.getTime() - earlierDate.getTime()) / (1000 * 60));

  const feedsWithTimeDiff = feeds.map((feed, index) => {
    const timeDiffString = index > 0 
      ? formatTimeInterval(getTimeDifferenceInMinutes(new Date(feed.feedTime), new Date(feeds[index - 1].feedTime)))
      : null;

    return {
      ...feed,
      timeSinceLastFeed: timeDiffString,
    };
  });

  const totalMilk = feeds.reduce((sum, feed) => sum + feed.amount, 0);
  const feedCount = feeds.length;
  const targetMilk = latestMeasurement?.dailyMilkAmount ?? 0;
  const remainingMilk = targetMilk - totalMilk;
  const remainingFeeds = FEEDS_PER_DAY - feedCount;
  const averageAmount = feedCount > 0 ? Math.round(totalMilk / feedCount) : 0;

  const lastFeed = feeds.filter(feed => feed.type === 'main').pop();
  const lastFeedTime = lastFeed ? lastFeed.feedTime : null;

  const timeSinceLastFeed = lastFeedTime 
    ? formatTimeInterval(getTimeDifferenceInMinutes(getCurrentTime(), new Date(lastFeedTime))) 
    : null;

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
    recommendedNextAmount: remainingFeeds > 0 ? Math.round(remainingMilk / remainingFeeds) : 0,
    feedsPerDay: FEEDS_PER_DAY,
  };
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