'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createCategory, updateCategory } from '@/server/actions/categoryActions'
import { categorySchema, type CategoryInput } from '@/server/validations/categoryValidations'

interface CategoryFormProps {
  category?: { id: string; name: string; description: string | null }
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = !!category

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
    },
  })

  async function onSubmit(data: CategoryInput) {
    setServerError(null)
    const result = isEditing
      ? await updateCategory(category.id, data)
      : await createCategory(data)

    if (!result.success) {
      setServerError(result.error)
      return
    }

    if (!isEditing) reset()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor={`name-${category?.id ?? 'new'}`}>Kategori Adı</Label>
        <Input
          id={`name-${category?.id ?? 'new'}`}
          placeholder="Örn: Genel Tartışma"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`desc-${category?.id ?? 'new'}`}>
          Açıklama <span className="text-muted-foreground">(opsiyonel)</span>
        </Label>
        <Textarea
          id={`desc-${category?.id ?? 'new'}`}
          placeholder="Kısa bir açıklama..."
          rows={2}
          className="resize-none"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          {isEditing ? 'Kaydet' : 'Kategori Ekle'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-3.5 w-3.5" />
            İptal
          </Button>
        )}
      </div>
    </form>
  )
}
