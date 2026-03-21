'use client'

import { useTransition } from 'react'
import { Pin, PinOff, Lock, LockOpen } from 'lucide-react'
import { pinThread, lockThread } from '@/server/actions/threadActions'

interface ThreadModActionsProps {
  threadId: string
  categorySlug: string
  isPinned: boolean
  isLocked: boolean
}

export function ThreadModActions({ threadId, categorySlug, isPinned, isLocked }: ThreadModActionsProps) {
  const [isPending, startTransition] = useTransition()

  function handlePin() {
    startTransition(async () => { await pinThread(threadId, categorySlug) })
  }

  function handleLock() {
    startTransition(async () => { await lockThread(threadId, categorySlug) })
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePin}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        aria-label={isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
      >
        {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        {isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
      </button>
      <button
        onClick={handleLock}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        aria-label={isLocked ? 'Kilidi aç' : 'Kilitle'}
      >
        {isLocked ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
        {isLocked ? 'Kilidi aç' : 'Kilitle'}
      </button>
    </div>
  )
}
