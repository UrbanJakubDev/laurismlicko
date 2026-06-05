// server/context.ts
import { prisma } from '@/lib/prisma'

export async function createTRPCContext(opts?: { headers?: Headers }) {
  return {
    prisma,
    headers: opts?.headers,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>
