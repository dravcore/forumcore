'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Trash2, Ban, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resolveReport } from '@/server/actions/reportActions'
import { deletePost } from '@/server/actions/postActions'
import { banUser } from '@/server/actions/userActions'

interface Props {
  report: {
    id: string
    targetType: string
    targetId: string
    reason: string
    reporter: { id: string; name: string; username: string | null }
    createdAt: Date
    // joined post/thread context
    postContent?: string | null
    postAuthorId?: string | null
    postCategorySlug?: string | null
    postThreadSlug?: string | null
  }
}

export function ModerationActions({ report }: Props) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (done) {
    return <span className="text-xs text-muted-foreground">İşlendi</span>
  }

  function handle(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn()
      setDone(true)
    })
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => handle(async () => { await resolveReport(report.id) })}
        className="h-7 gap-1 text-xs"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
        Reddet
      </Button>

      {report.targetType === 'post' && report.postCategorySlug && report.postThreadSlug && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => handle(async () => {
            await deletePost(report.targetId, report.postCategorySlug!, report.postThreadSlug!)
            await resolveReport(report.id)
          })}
          className="h-7 gap-1 text-xs text-destructive hover:border-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
          İçeriği Sil
        </Button>
      )}

      {report.postAuthorId && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => handle(async () => {
            await banUser(report.postAuthorId!, report.reason)
            await resolveReport(report.id)
          })}
          className="h-7 gap-1 text-xs text-destructive hover:border-destructive hover:text-destructive"
        >
          <Ban className="h-3 w-3" />
          Yasakla
        </Button>
      )}
    </div>
  )
}
