'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, Check, MessageSquare, Heart, AtSign, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/lib/buttonVariants'
import { markAllAsRead } from '@/server/actions/notificationActions'

type Notification = {
  id: string
  type: 'REPLY' | 'MENTION' | 'REACTION' | 'MESSAGE'
  isRead: boolean
  createdAt: Date
  threadId: string | null
  postId: string | null
  actorId: string | null
}

type SSEMessage =
  | { type: 'init'; unreadCount: number }
  | { type: 'notification'; notifications: Notification[]; unreadCount: number }

const ICONS = {
  REPLY: MessageSquare,
  MENTION: AtSign,
  REACTION: Heart,
  MESSAGE: MessageCircle,
}

const LABELS = {
  REPLY: 'konunuza yanıt verdi',
  MENTION: 'sizi bahsetti',
  REACTION: 'yanıtınızı beğendi',
  MESSAGE: 'size özel mesaj gönderdi',
}

export function NotificationBell({ initialCount }: { initialCount: number }) {
  const [unreadCount, setUnreadCount] = useState(initialCount)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // SSE connection
  useEffect(() => {
    let es: EventSource
    let retryTimeout: ReturnType<typeof setTimeout>

    function connect() {
      es = new EventSource('/api/sse')

      es.onmessage = (e) => {
        const data = JSON.parse(e.data) as SSEMessage
        if (data.type === 'init') {
          setUnreadCount(data.unreadCount)
        } else if (data.type === 'notification') {
          setUnreadCount(data.unreadCount)
          setNotifications((prev) => [...data.notifications, ...prev].slice(0, 20))
        }
      }

      es.onerror = () => {
        es.close()
        retryTimeout = setTimeout(connect, 5000)
      }
    }

    connect()
    return () => {
      es?.close()
      clearTimeout(retryTimeout)
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleMarkAll() {
    await markAllAsRead()
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'relative')}
        aria-label="Bildirimler"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">Bildirimler</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Check className="h-3 w-3" />
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Henüz bildirim yok
              </p>
            ) : (
              notifications.map((n) => {
                const Icon = ICONS[n.type]
                const label = LABELS[n.type]
                const href = n.type === 'MESSAGE' ? '/messages' : n.threadId ? `/c/${n.threadId}` : '/'

                return (
                  <Link
                    key={n.id}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted',
                      !n.isRead && 'bg-muted/50'
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Birisi {label}
                    </span>
                    {!n.isRead && (
                      <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
