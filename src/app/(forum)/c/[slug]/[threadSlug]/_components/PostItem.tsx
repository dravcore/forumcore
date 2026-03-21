'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { updatePost, deletePost } from '@/server/actions/postActions'
import { formatDistanceToNow, formatDate } from '@/lib/dateUtils'

interface PostItemProps {
  post: {
    id: string
    content: string
    editedAt: Date | null
    createdAt: Date
    author: { id: string; name: string; username: string | null }
  }
  isOP: boolean
  canEdit: boolean
  categorySlug: string
  threadSlug: string
}

export function PostItem({ post, isOP, canEdit, categorySlug, threadSlug }: PostItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [isPending, startTransition] = useTransition()
  const [editError, setEditError] = useState<string | null>(null)

  function handleSaveEdit() {
    setEditError(null)
    startTransition(async () => {
      const result = await updatePost(post.id, categorySlug, threadSlug, { content: editContent })
      if (!result.success) { setEditError(result.error); return }
      setIsEditing(false)
    })
  }

  function handleDelete() {
    if (!confirm('Bu yanıtı silmek istediğinden emin misin?')) return
    startTransition(async () => {
      await deletePost(post.id, categorySlug, threadSlug)
    })
  }

  const displayName = post.author.username ?? post.author.name

  return (
    <div className="rounded-lg border bg-card p-5" id={`post-${post.id}`}>
      {/* Author header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/u/${displayName}`} className="text-sm font-medium hover:text-primary">
              {displayName}
            </Link>
            {isOP && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                Konu Yazarı
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground" title={formatDate(post.createdAt)}>
            {formatDistanceToNow(post.createdAt)}
            {post.editedAt && ' (düzenlendi)'}
          </span>
          {canEdit && !isEditing && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} aria-label="Düzenle" className="h-7 w-7 p-0">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending} aria-label="Sil" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          {editError && <p className="text-xs text-destructive">{editError}</p>}
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={6}
            className="resize-y text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit} disabled={isPending}>
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Kaydet
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditContent(post.content) }} disabled={isPending}>
              <X className="h-3.5 w-3.5" />İptal
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm leading-relaxed text-foreground">
          {post.content.split('\n').map((line, i) => (
            <p key={i} className={line === '' ? 'my-1' : ''}>{line || '\u00A0'}</p>
          ))}
        </div>
      )}
    </div>
  )
}
