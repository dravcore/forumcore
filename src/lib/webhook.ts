import { createHmac } from 'crypto'
import { db } from '@/lib/db'

export type WebhookEvent = 'thread.created' | 'post.created' | 'user.banned'

interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: Record<string, unknown>
}

/**
 * Dispatches a webhook event to all active subscribed webhooks.
 * Fires in background — does not throw or block the caller.
 */
export function dispatchWebhook(event: WebhookEvent, data: Record<string, unknown>): void {
  void (async () => {
    const webhooks = await db.webhook.findMany({
      where: { isActive: true, events: { has: event } },
      select: { id: true, url: true, secret: true },
    })

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    }

    const body = JSON.stringify(payload)

    await Promise.allSettled(
      webhooks.map(async (wh) => {
        const sig = createHmac('sha256', wh.secret).update(body).digest('hex')
        await fetch(wh.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-ForumCore-Signature': `sha256=${sig}`,
            'X-ForumCore-Event': event,
          },
          body,
          signal: AbortSignal.timeout(10_000),
        })
      })
    )
  })()
}
