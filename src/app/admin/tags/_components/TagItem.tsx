'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2, GitMerge, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteTag, renameTag, mergeTag } from '@/server/actions/tagActions'

interface Tag {
  id: string
  name: string
  slug: string
  _count: { threads: number }
}

interface TagItemProps {
  tag: Tag
  allTags: Tag[]
}

export function TagItem({ tag, allTags }: TagItemProps) {
  const [mode, setMode] = useState<'view' | 'rename' | 'merge'>('view')
  const [renameValue, setRenameValue] = useState(tag.name)
  const [mergeTargetId, setMergeTargetId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`"${tag.name}" etiketini silmek istediğinden emin misin? Bu işlem geri alınamaz.`)) return
    startTransition(async () => {
      const result = await deleteTag(tag.id)
      if (!result.success) alert('Silme başarısız.')
    })
  }

  function handleRename(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await renameTag(tag.id, { name: renameValue })
      if (!result.success) {
        setError(result.error)
      } else {
        setMode('view')
      }
    })
  }

  function handleMerge(e: React.FormEvent) {
    e.preventDefault()
    if (!mergeTargetId) return
    const target = allTags.find((t) => t.id === mergeTargetId)
    if (!confirm(`"${tag.name}" etiketindeki tüm konular "${target?.name}" etiketine taşınacak ve "${tag.name}" silinecek. Devam etmek istiyor musun?`)) return
    setError(null)
    startTransition(async () => {
      const result = await mergeTag(tag.id, mergeTargetId)
      if (!result.success) {
        setError(result.error)
      } else {
        setMode('view')
      }
    })
  }

  if (mode === 'rename') {
    return (
      <div className="rounded-lg border bg-card p-4">
        <form onSubmit={handleRename} className="flex items-center gap-2">
          <Input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            disabled={isPending}
            className="flex-1"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={isPending || renameValue.trim().length < 2}>
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setMode('view'); setError(null); setRenameValue(tag.name) }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    )
  }

  if (mode === 'merge') {
    const targets = allTags.filter((t) => t.id !== tag.id)
    return (
      <div className="rounded-lg border bg-card p-4">
        <form onSubmit={handleMerge} className="flex items-center gap-2">
          <p className="shrink-0 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">#{tag.name}</span> →
          </p>
          <select
            value={mergeTargetId}
            onChange={(e) => setMergeTargetId(e.target.value)}
            disabled={isPending}
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Hedef etiket seç...</option>
            {targets.map((t) => (
              <option key={t.id} value={t.id}>#{t.name} ({t._count.threads} konu)</option>
            ))}
          </select>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={isPending || !mergeTargetId}>
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setMode('view'); setError(null); setMergeTargetId('') }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">#{tag.name}</span>
          <span className="text-xs text-muted-foreground">/{tag.slug}</span>
        </div>
      </div>
      <span className="shrink-0 text-sm text-muted-foreground">{tag._count.threads} konu</span>
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMode('rename')}
          aria-label="Yeniden adlandır"
          title="Yeniden adlandır"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMode('merge')}
          aria-label="Birleştir"
          title="Birleştir"
          disabled={allTags.length < 2}
        >
          <GitMerge className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label="Sil"
          title="Sil"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
