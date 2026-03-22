'use client'

import { useState, useTransition } from 'react'
import { Bookmark } from 'lucide-react'
import { toggleBookmark } from '@/server/actions/bookmarkActions'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  threadId: string
  categorySlug: string
  threadSlug: string
  initialBookmarked: boolean
}

export function BookmarkButton({ threadId, categorySlug, threadSlug, initialBookmarked }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleBookmark(threadId, categorySlug, threadSlug)
      if (result.success) setBookmarked(result.bookmarked)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={bookmarked ? 'Yer iminden çıkar' : 'Yer imine ekle'}
      title={bookmarked ? 'Yer iminden çıkar' : 'Yer imine ekle'}
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors hover:bg-accent',
        bookmarked ? 'text-primary' : 'text-muted-foreground',
        isPending && 'opacity-50'
      )}
    >
      <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
      <span>{bookmarked ? 'Kaydedildi' : 'Kaydet'}</span>
    </button>
  )
}
