'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { acceptAnswer } from '@/server/actions/pollActions'
import { cn } from '@/lib/utils'

interface AcceptAnswerButtonProps {
  postId: string
  categorySlug: string
  threadSlug: string
  isAccepted: boolean
}

export function AcceptAnswerButton({
  postId,
  categorySlug,
  threadSlug,
  isAccepted,
}: AcceptAnswerButtonProps) {
  const [accepted, setAccepted] = useState(isAccepted)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await acceptAnswer(postId, categorySlug, threadSlug)
      if (result.success) setAccepted(!accepted)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={accepted ? 'Kabul edilen yanıtı kaldır' : 'Kabul edilen yanıt olarak işaretle'}
      aria-label={accepted ? 'Kabul edilen yanıtı kaldır' : 'Yanıtı kabul et'}
      className={cn(
        'flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors',
        accepted
          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
          : 'text-muted-foreground hover:bg-muted',
        isPending && 'opacity-50'
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <CheckCircle2 className={cn('h-3.5 w-3.5', accepted && 'fill-emerald-500 text-white dark:fill-emerald-400')} />
      )}
      {accepted ? 'Kabul Edildi' : 'Kabul Et'}
    </button>
  )
}
