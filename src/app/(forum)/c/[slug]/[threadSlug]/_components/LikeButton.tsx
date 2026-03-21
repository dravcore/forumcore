'use client'

import { useState, useTransition } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleReaction } from '@/server/actions/reactionActions'

interface LikeButtonProps {
  postId: string
  initialCount: number
  initialLiked: boolean
}

export function LikeButton({ postId, initialCount, initialLiked }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleReaction(postId, 'LIKE')
      if (result.success) {
        setLiked(result.liked)
        setCount(result.count)
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={liked ? 'Beğeniyi kaldır' : 'Beğen'}
      className={`h-7 gap-1.5 px-2 text-xs transition-colors ${liked ? 'text-rose-500 hover:text-rose-600' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
      )}
      {count > 0 && <span>{count}</span>}
    </Button>
  )
}
