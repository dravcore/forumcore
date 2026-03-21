import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.id
  let lastCheck = new Date()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial unread count
      const count = await db.notification.count({
        where: { userId, isRead: false },
      })
      send({ type: 'init', unreadCount: count })

      // Poll for new notifications every 15s
      const interval = setInterval(async () => {
        try {
          const newNotifications = await db.notification.findMany({
            where: { userId, createdAt: { gt: lastCheck } },
            orderBy: { createdAt: 'desc' },
          })

          if (newNotifications.length > 0) {
            const unreadCount = await db.notification.count({
              where: { userId, isRead: false },
            })
            send({ type: 'notification', notifications: newNotifications, unreadCount })
            lastCheck = new Date()
          }
        } catch {
          clearInterval(interval)
          controller.close()
        }
      }, 15000)

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
