import { getFeedStats } from "@/app/actions"
import { NextResponse } from "next/server"

// app/api/feeds/route.ts
export async function GET(request: Request) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const babyId = searchParams.get('babyId')
    const dateStr = searchParams.get('date')

    // Validate required parameters
    if (!babyId || !dateStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: babyId and date' }, 
        { status: 400 }
      )
    }

    // Validate babyId is numeric
    const babyIdNum = parseInt(babyId)
    if (isNaN(babyIdNum)) {
      return NextResponse.json(
        { error: 'babyId must be a valid number' },
        { status: 400 }
      )
    }

    // Validate date string
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Get feed stats
    const stats = await getFeedStats(babyIdNum, date)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching feed stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


