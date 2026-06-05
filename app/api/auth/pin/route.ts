// app/api/auth/pin/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { pin } = body as { pin: string }

  const correctPin = process.env.APP_PIN

  if (!correctPin) {
    return NextResponse.json(
      { success: false, error: 'PIN není nakonfigurován' },
      { status: 500 }
    )
  }

  if (pin === correctPin) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json(
    { success: false, error: 'Nesprávný PIN' },
    { status: 401 }
  )
}
