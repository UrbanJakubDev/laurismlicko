// server/routers/_app.ts
import { router } from '../trpc'
import { babyRouter } from './baby'
import { feedRouter } from './feed'
import { foodRouter } from './food'
import { measurementRouter } from './measurement'

export const appRouter = router({
  baby: babyRouter,
  feed: feedRouter,
  food: foodRouter,
  measurement: measurementRouter,
})

export type AppRouter = typeof appRouter
