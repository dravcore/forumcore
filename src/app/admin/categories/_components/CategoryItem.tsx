'use client'

import { useState, useTransition } from 'react'
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteCategory, reorderCategory } from '@/server/actions/categoryActions'
import { CategoryForm } from './CategoryForm'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  _count: { threads: number }
}

interface CategoryItemProps {
  category: Category
  isFirst: boolean
  isLast: boolean
}

export function CategoryItem({ category, isFirst, isLast }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleReorder(direction: 'up' | 'down') {
    startTransition(async () => {
      await reorderCategory(category.id, direction)
    })
  }

  function handleDelete() {
    if (!confirm(`"${category.name}" kategorisini silmek istediğinden emin misin?`)) return
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (!result.success) alert(result.error)
    })
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <CategoryForm
          category={category}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30">
      {/* Reorder */}
      <div className="flex flex-col gap-0.5">
        <button
          onClick={() => handleReorder('up')}
          disabled={isFirst || isPending}
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
          aria-label="Yukarı taşı"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handleReorder('down')}
          disabled={isLast || isPending}
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
          aria-label="Aşağı taşı"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{category.name}</span>
          <span className="text-xs text-muted-foreground">/{category.slug}</span>
        </div>
        {category.description && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{category.description}</p>
        )}
      </div>

      {/* Thread count */}
      <span className="shrink-0 text-sm text-muted-foreground">
        {category._count.threads} konu
      </span>

      {/* Actions */}
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          aria-label="Düzenle"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label="Sil"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
