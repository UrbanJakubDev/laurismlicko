import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const id = params.id

    try {
      // Validate required parameters
      if (!id) {
        return NextResponse.json(
          { error: 'Missing required parameters: id' },
          { status: 400 }
        )
      }
  
      // Validate id is numeric
      const feedId = parseInt(id as string)
      if (isNaN(feedId)) {
        return NextResponse.json(
          { error: 'id must be a valid number' },
          { status: 400 }
        )
      }
  
      // Delete the feed
      await prisma.feed.delete({
        where: { id: feedId }
      })
  
    } catch (error) {
      console.error('Error deleting feed:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  
    return NextResponse.json({
      success: true,
      message: 'Feed deleted successfully'
    })
  } 