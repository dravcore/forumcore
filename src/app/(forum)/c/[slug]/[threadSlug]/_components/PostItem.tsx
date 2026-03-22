'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Loader2, Check, X, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/shared/RichTextEditor'
import { RichTextRenderer } from '@/components/shared/RichTextRenderer'
import { updatePost, deletePost } from '@/server/actions/postActions'
import { formatDistanceToNow, formatDate } from '@/lib/dateUtils'
import { LikeButton } from './LikeButton'
import { ReportButton } from './ReportButton'
import { AcceptAnswerButton } from './AcceptAnswerButton'

interface PostItemProps {
  post: {
    id: string
    content: string
    processedContent?: string
    editedAt: Date | null
    createdAt: Date
    author: { id: string; name: string; username: string | null; trustLevel: string; reputation: number }
    _count: { reactions: number }
    reactions: { id: string }[]
  }
  isOP: boolean
  canEdit: boolean
  isLoggedIn: boolean
  categorySlug: string
  threadSlug: string
  onQuote?: (html: string) => void
  isQA?: boolean
  isAccepted?: boolean
  canAcceptAnswer?: boolean
}

export function PostItem({
  post,
  isOP,
  canEdit,
  isLoggedIn,
  categorySlug,
  threadSlug,
  onQuote,
  isQA,
  isAccepted,
  canAcceptAnswer,
}: PostItemProps) {
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

  function handleQuote() {
    const displayName = post.author.username ?? post.author.name
    const plainText = post.content.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
    const quoted = `<blockquote><p><strong>${displayName}</strong> yazdı:</p><p>${plainText}</p></blockquote><p></p>`
    onQuote?.(quoted)
  }

  const displayName = post.author.username ?? post.author.name
  const liked = post.reactions.length > 0

  return (
    <div
      className={`rounded-lg border bg-card p-5 ${isQA && isAccepted ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
      id={`post-${post.id}`}
    >
      {isQA && isAccepted && (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5" />Kabul Edilen Yanıt
        </div>
      )}

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
            {post.author.trustLevel === 'VETERAN' && (
              <span title="Veteran" className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                🏆 Veteran
              </span>
            )}
            {post.author.trustLevel === 'REGULAR' && (
              <span title="Düzenli Üye" className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                ⭐ Düzenli
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                aria-label="Düzenle"
                className="h-7 w-7 p-0"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                aria-label="Sil"
                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
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
          <RichTextEditor
            value={editContent}
            onChange={setEditContent}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit} disabled={isPending}>
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Kaydet
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setIsEditing(false); setEditContent(post.content) }}
              disabled={isPending}
            >
              <X className="h-3.5 w-3.5" />İptal
            </Button>
          </div>
        </div>
      ) : (
        <RichTextRenderer content={post.processedContent ?? post.content} />
      )}

      {/* Post footer actions */}
      {!isEditing && (
        <div className="mt-3 flex items-center gap-1 border-t pt-3">
          <LikeButton
            postId={post.id}
            initialCount={post._count.reactions}
            initialLiked={liked}
          />
          {isLoggedIn && onQuote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuote}
              aria-label="Alıntıla"
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Quote className="h-3.5 w-3.5" />
            </Button>
          )}
          {isQA && canAcceptAnswer && (
            <AcceptAnswerButton
              postId={post.id}
              categorySlug={categorySlug}
              threadSlug={threadSlug}
              isAccepted={!!isAccepted}
            />
          )}
          {isLoggedIn && (
            <div className="ml-auto">
              <ReportButton targetType="POST" targetId={post.id} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
