import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageCircle, MailOpen } from 'lucide-react'
import { getSession } from '@/lib/session'
import { getConversations } from '@/server/queries/dmQueries'
import { formatDistanceToNow } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Özel Mesajlar' }

export default async function MessagesPage() {
  const session = await getSession()
  if (!session) redirect('/login?callbackUrl=/messages')

  const conversations = await getConversations(session.user.id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Özel Mesajlar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gelen konuşmalarınız</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-20 text-center">
          <MailOpen className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">Henüz mesajınız yok</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bir kullanıcının profiline giderek mesaj gönderebilirsin.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-px overflow-hidden rounded-lg border bg-card">
          {conversations.map((conv) => {
            const otherUser = conv.participants[0]?.user
            const lastMessage = conv.messages[0]
            const unread = conv._count.messages

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={cn(
                  'flex items-center gap-4 bg-card px-4 py-4 transition-colors hover:bg-accent/40',
                  unread > 0 && 'bg-primary/5'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                  {otherUser
                    ? (otherUser.username ?? otherUser.name).charAt(0).toUpperCase()
                    : '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium', unread > 0 && 'font-semibold')}>
                      {otherUser?.username ?? otherUser?.name ?? 'Bilinmeyen kullanıcı'}
                    </span>
                    {unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {lastMessage.senderId === session.user.id ? 'Sen: ' : ''}
                      {lastMessage.content}
                    </p>
                  )}
                </div>
                {lastMessage && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(lastMessage.createdAt)}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
