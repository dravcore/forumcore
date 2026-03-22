import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MessageSquare, Pin, Lock, Tag, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { getTagBySlug, getThreadsByTag } from '@/server/queries/tagQueries'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/dateUtils'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  if (!tag) return { title: 'Etiket bulunamadı' }
  return {
    title: `#${tag.name}`,
    description: `${tag._count.threads} konu bu etiketle işaretlenmiş.`,
  }
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const tag = await getTagBySlug(slug)
  if (!tag) notFound()

  const { threads, total, totalPages } = await getThreadsByTag(slug, page)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-3.5 w-3.5" />
          Ana Sayfa
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">#{tag.name}</h1>
            <p className="text-sm text-muted-foreground">{total} konu</p>
          </div>
        </div>
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">Bu etiketle konu bulunamadı</p>
        </div>
      ) : (
        <div className="flex flex-col gap-px overflow-hidden rounded-lg border bg-card">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/c/${thread.category.slug}/${thread.slug}`}
              className="group flex items-center gap-4 bg-card px-4 py-3.5 transition-colors hover:bg-accent/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {thread.isLocked ? <Lock className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {thread.isPinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
                  <span className="truncate font-medium group-hover:text-primary">{thread.title}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {thread.author.username ?? thread.author.name}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(thread.createdAt)}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <Link
                    href={`/c/${thread.category.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {thread.category.name}
                  </Link>
                  {thread.tags.map(({ tag: t }) => (
                    <span
                      key={t.id}
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        t.slug === slug
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{thread.viewCount}</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{Math.max(0, thread._count.posts - 1)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/tags/${slug}?page=${page - 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              <ChevronLeft className="h-4 w-4" />Önceki
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/tags/${slug}?page=${page + 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Sonraki<ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
