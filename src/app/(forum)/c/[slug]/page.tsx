import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MessageSquare, Pin, Lock, Plus, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { getCategoryBySlug } from '@/server/queries/categoryQueries'
import { getThreadsByCategory } from '@/server/queries/threadQueries'
import { getSession } from '@/lib/session'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/dateUtils'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Kategori bulunamadı' }
  return { title: category.name }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const [category, session] = await Promise.all([getCategoryBySlug(slug), getSession()])
  if (!category) notFound()

  const { threads, total, pageCount } = await getThreadsByCategory(slug, page)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-3.5 w-3.5" />
          Kategoriler
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
            )}
          </div>
          {session && (
            <Link href={`/c/${slug}/new`} className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}>
              <Plus className="h-4 w-4" />
              Yeni Konu
            </Link>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{total} konu</p>
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">Henüz konu açılmamış</p>
            {session && <p className="mt-1 text-sm text-muted-foreground">İlk konuyu sen aç!</p>}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-px overflow-hidden rounded-lg border bg-card">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/c/${slug}/${thread.slug}`}
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
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{thread.author.username ?? thread.author.name}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(thread.createdAt)}</span>
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

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/c/${slug}?page=${page - 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              <ChevronLeft className="h-4 w-4" />Önceki
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{page} / {pageCount}</span>
          {page < pageCount && (
            <Link href={`/c/${slug}?page=${page + 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Sonraki<ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
