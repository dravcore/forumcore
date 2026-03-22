'use client'

import { useState, useTransition } from 'react'
import { ThumbsDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleReaction } from '@/server/actions/reactionActions'
import { cn } from '@/lib/utils'

interface DownvoteButtonProps {
  postId: string
  initialDisliked: boolean
}

export function DownvoteButton({ postId, initialDisliked }: DownvoteButtonProps) {
  const [disliked, setDisliked] = useState(initialDisliked)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleReaction(postId, 'DISLIKE')
      if (result.success) setDisliked(result.liked)
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={disliked ? 'Beğenmemeyi kaldır' : 'Beğenme'}
      className={cn(
        'h-7 gap-1.5 px-2 text-xs transition-colors',
        disliked ? 'text-blue-500 hover:text-blue-600' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <ThumbsDown className={cn('h-3.5 w-3.5', disliked && 'fill-current')} />
      )}
    </Button>
  )
}
