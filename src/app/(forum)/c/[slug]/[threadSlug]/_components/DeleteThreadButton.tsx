'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteThread } from '@/server/actions/threadActions'

interface DeleteThreadButtonProps {
  threadId: string
  categorySlug: string
}

export function DeleteThreadButton({ threadId, categorySlug }: DeleteThreadButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Bu konuyu silmek istediğinden emin misin? Bu işlem geri alınamaz.')) return
    startTransition(async () => {
      const result = await deleteThread(threadId, categorySlug)
      if (result.success) router.push(`/c/${categorySlug}`)
      else alert(result.error)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
      aria-label="Konuyu sil"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Sil
    </button>
  )
}
