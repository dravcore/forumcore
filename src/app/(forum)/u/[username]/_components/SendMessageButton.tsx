'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Loader2 } from 'lucide-react'
import { startConversation } from '@/server/actions/dmActions'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'

export function SendMessageButton({ targetUserId }: { targetUserId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await startConversation(targetUserId)
      if (result.success) {
        router.push(`/messages/${result.conversationId}`)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-3 w-full')}
    >
      {isPending
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <MessageCircle className="h-3.5 w-3.5" />}
      Mesaj Gönder
    </button>
  )
}
