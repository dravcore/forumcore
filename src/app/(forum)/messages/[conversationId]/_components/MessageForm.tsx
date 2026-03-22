'use client'

import { useState, useTransition } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { sendMessage } from '@/server/actions/dmActions'

export function MessageForm({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await sendMessage(conversationId, { content: content.trim() })
      if (!result.success) {
        setError(result.error)
      } else {
        setContent('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background px-4 py-3">
      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
      <div className="flex items-center gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as unknown as React.FormEvent)
            }
          }}
          placeholder="Mesajınızı yazın..."
          disabled={isPending}
          maxLength={5000}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          aria-label="Gönder"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </form>
  )
}
