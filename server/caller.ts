// server/caller.ts
import 'server-only'
import { createCallerFactory } from './trpc'
import { createTRPCContext } from './context'
import { appRouter } from './routers/_app'

const createCaller = createCallerFactory(appRouter)

export async function getServerCaller() {
  const ctx = await createTRPCContext()
  return createCaller(ctx)
}
