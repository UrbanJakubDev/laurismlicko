import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
)

async function handler(req: NextRequest) {
  try {
    const body = await req.json()
    const { subscription, title, message } = body

    if (!subscription) {
      return NextResponse.json(
        { error: 'Missing push subscription' },
        { status: 400 }
      )
    }

    const payload = JSON.stringify({
      title: title || 'Čas na krmení!',
      body: message || 'Je čas nakrmit miminko.',
    })

    await webpush.sendNotification(subscription, payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending push notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// QStash verification wrapper
export const POST = verifySignatureAppRouter(handler)
