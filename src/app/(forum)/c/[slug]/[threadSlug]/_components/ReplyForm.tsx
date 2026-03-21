'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPost } from '@/server/actions/postActions'
import { postContentSchema, type PostContentInput } from '@/server/validations/postValidations'

interface ReplyFormProps {
  threadId: string
  categorySlug: string
  threadSlug: string
  initialContent?: string
  onQuoteConsumed?: () => void
}

export function ReplyForm({ threadId, categorySlug, threadSlug, initialContent, onQuoteConsumed }: ReplyFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, getValues, formState: { errors, isSubmitting } } = useForm<PostContentInput>({
    resolver: zodResolver(postContentSchema),
  })

  useEffect(() => {
    if (initialContent) {
      const current = getValues('content') ?? ''
      setValue('content', initialContent + current)
      onQuoteConsumed?.()
    }
  }, [initialContent]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: PostContentInput) {
    setServerError(null)
    const result = await createPost(threadId, categorySlug, data)
    if (!result.success) { setServerError(result.error); return }
    reset()
  }

  return (
    <div className="mt-6 rounded-lg border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Yanıtla</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {serverError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="reply-content" className="sr-only">Yanıt içeriği</Label>
          <Textarea
            id="reply-content"
            placeholder="Yanıtını yaz..."
            rows={5}
            className="resize-y"
            aria-invalid={!!errors.content}
            {...register('content')}
          />
          {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? 'Gönderiliyor...' : 'Yanıt Gönder'}
        </Button>
      </form>
    </div>
  )
}
