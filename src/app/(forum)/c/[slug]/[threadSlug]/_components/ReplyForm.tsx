'use client'

import { useRef, useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RichTextEditor, type RichTextEditorRef } from '@/components/shared/RichTextEditor'
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
  const editorRef = useRef<RichTextEditorRef>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const { handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<PostContentInput>({
    resolver: zodResolver(postContentSchema),
    defaultValues: { content: '' },
  })

  useEffect(() => {
    if (initialContent && editorRef.current) {
      editorRef.current.insertAtStart(initialContent)
      onQuoteConsumed?.()
    }
  }, [initialContent]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: PostContentInput) {
    setServerError(null)
    const result = await createPost(threadId, categorySlug, data)
    if (!result.success) { setServerError(result.error); return }
    reset()
    editorRef.current?.clear()
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
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              ref={editorRef}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Yanıtını yaz..."
            />
          )}
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? 'Gönderiliyor...' : 'Yanıt Gönder'}
        </Button>
      </form>
    </div>
  )
}
