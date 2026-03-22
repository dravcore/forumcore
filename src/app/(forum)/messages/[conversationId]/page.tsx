import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getSession } from '@/lib/session'
import { getConversationMessages } from '@/server/queries/dmQueries'
import { markMessagesRead } from '@/server/actions/dmActions'
import { formatDate, formatDistanceToNow } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'
import { MessageForm } from './_components/MessageForm'

interface Props {
  params: Promise<{ conversationId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: 'Konuşma' }
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  const data = await getConversationMessages(conversationId, session.user.id)
  if (!data) notFound()

  const { messages, conversation } = data
  const otherUser = conversation?.participants[0]?.user

  // Mark unread messages as read
  await markMessagesRead(conversationId)

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-8" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Link href="/messages" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {otherUser ? (otherUser.username ?? otherUser.name).charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <Link
              href={`/u/${otherUser?.username ?? otherUser?.name}`}
              className="text-sm font-medium hover:text-primary"
            >
              {otherUser?.username ?? otherUser?.name ?? 'Bilinmeyen kullanıcı'}
            </Link>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 rounded-lg border bg-card p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Henüz mesaj yok. İlk mesajı gönder!
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === session.user.id
            return (
              <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                    isMine
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-muted text-foreground'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={cn('mt-1 text-[11px]', isMine ? 'text-primary-foreground/70' : 'text-muted-foreground')}
                     title={formatDate(msg.createdAt)}>
                    {formatDistanceToNow(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Send form */}
      <MessageForm conversationId={conversationId} />
    </div>
  )
}
