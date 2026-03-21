import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, Lock, Pin, User } from 'lucide-react'
import { getThreadBySlug, getPostsByThread } from '@/server/queries/threadQueries'
import { getSession } from '@/lib/session'
import { formatDistanceToNow, formatDate } from '@/lib/dateUtils'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'
import { PostItem } from './_components/PostItem'
import { ReplyForm } from './_components/ReplyForm'
import { DeleteThreadButton } from './_components/DeleteThreadButton'
import { ThreadModActions } from './_components/ThreadModActions'

interface Props {
  params: Promise<{ slug: string; threadSlug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { threadSlug } = await params
  const thread = await getThreadBySlug(threadSlug)
  if (!thread) return { title: 'Konu bulunamadı' }
  return { title: thread.title }
}

export default async function ThreadPage({ params, searchParams }: Props) {
  const { slug, threadSlug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const [thread, session] = await Promise.all([getThreadBySlug(threadSlug), getSession()])
  if (!thread || thread.category.slug !== slug) notFound()

  const { posts, pageCount } = await getPostsByThread(thread.id, page)

  const isMod = session && (session.user.role === 'ADMIN' || session.user.role === 'MODERATOR')
  const canDeleteThread = session && (session.user.id === thread.authorId || !!isMod)
  const firstPostGlobalIndex = (page - 1) * 20

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <Link href={`/c/${slug}`} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-3.5 w-3.5" />{thread.category.name}
      </Link>

      {/* Thread Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2 min-w-0">
            {thread.isPinned && <Pin className="mt-1 h-4 w-4 shrink-0 text-primary" />}
            {thread.isLocked && <Lock className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
            <h1 className="text-2xl font-bold leading-tight">{thread.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {isMod && (
              <ThreadModActions
                threadId={thread.id}
                categorySlug={slug}
                isPinned={thread.isPinned}
                isLocked={thread.isLocked}
              />
            )}
            {canDeleteThread && <DeleteThreadButton threadId={thread.id} categorySlug={slug} />}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {thread.author.username ?? thread.author.name}
          </span>
          <span>·</span>
          <span title={formatDate(thread.createdAt)}>{formatDistanceToNow(thread.createdAt)}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{thread.viewCount} görüntülenme</span>
          <span>·</span>
          <span>{Math.max(0, thread._count.posts - 1)} yanıt</span>
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-4">
        {posts.map((post, index) => {
          const canEditPost = !!(session && (session.user.id === post.author.id || isMod))
          return (
            <PostItem
              key={post.id}
              post={post}
              isOP={firstPostGlobalIndex + index === 0}
              canEdit={canEditPost}
              categorySlug={slug}
              threadSlug={threadSlug}
            />
          )
        })}
      </div>

      {/* Post Pagination */}
      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/c/${slug}/${threadSlug}?page=${page - 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              <ChevronLeft className="h-4 w-4" />Önceki
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{page} / {pageCount}</span>
          {page < pageCount && (
            <Link href={`/c/${slug}/${threadSlug}?page=${page + 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Sonraki<ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      {/* Reply Section */}
      {thread.isLocked ? (
        <div className="mt-6 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          <Lock className="mx-auto mb-2 h-4 w-4" />
          Bu konu kilitli. Yeni yanıt eklenemez.
        </div>
      ) : session ? (
        <ReplyForm threadId={thread.id} categorySlug={slug} threadSlug={threadSlug} />
      ) : (
        <div className="mt-6 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Yanıt vermek için{' '}
          <Link href={`/login?callbackUrl=/c/${slug}/${threadSlug}`} className="font-medium text-primary hover:underline">
            giriş yap
          </Link>
          .
        </div>
      )}
    </div>
  )
}
