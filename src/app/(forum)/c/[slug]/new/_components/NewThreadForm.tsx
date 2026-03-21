'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createThread } from '@/server/actions/threadActions'
import { createThreadSchema, type CreateThreadInput } from '@/server/validations/threadValidations'

interface NewThreadFormProps {
  categorySlug: string
}

export function NewThreadForm({ categorySlug }: NewThreadFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateThreadInput>({
    resolver: zodResolver(createThreadSchema),
  })

  async function onSubmit(data: CreateThreadInput) {
    setServerError(null)
    const result = await createThread(categorySlug, data)

    if (!result.success) {
      setServerError(result.error)
      return
    }

    router.push(`/c/${categorySlug}/${result.thread.slug}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Başlık</Label>
        <Input
          id="title"
          placeholder="Konu başlığını yaz..."
          aria-invalid={!!errors.title}
          {...register('title')}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">İçerik</Label>
        <Textarea
          id="content"
          placeholder="Konuyu detaylıca açıkla..."
          rows={10}
          className="resize-y"
          aria-invalid={!!errors.content}
          {...register('content')}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? 'Gönderiliyor...' : 'Konu Aç'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          İptal
        </Button>
      </div>
    </form>
  )
}
