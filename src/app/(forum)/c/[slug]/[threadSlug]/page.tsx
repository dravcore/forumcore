import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Pin, Lock, Eye, User } from 'lucide-react'
import { getThreadWithPosts } from '@/server/queries/threadQueries'
import { getSession } from '@/lib/session'
import { formatDistanceToNow, formatDate } from '@/lib/dateUtils'
import { DeleteThreadButton } from './_components/DeleteThreadButton'

interface Props {
  params: Promise<{ slug: string; threadSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { threadSlug } = await params
  const thread = await getThreadWithPosts(threadSlug)
  if (!thread) return { title: 'Konu bulunamadı' }
  return { title: thread.title }
}

export default async function ThreadPage({ params }: Props) {
  const { slug, threadSlug } = await params

  const [thread, session] = await Promise.all([
    getThreadWithPosts(threadSlug),
    getSession(),
  ])

  if (!thread || thread.category.slug !== slug) notFound()

  const canDelete =
    session &&
    (session.user.id === thread.authorId ||
      session.user.role === 'ADMIN' ||
      session.user.role === 'MODERATOR')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <Link
        href={`/c/${slug}`}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {thread.category.name}
      </Link>

      {/* Thread Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            {thread.isPinned && <Pin className="mt-1 h-4 w-4 shrink-0 text-primary" />}
            {thread.isLocked && <Lock className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
            <h1 className="text-2xl font-bold leading-tight">{thread.title}</h1>
          </div>
          {canDelete && (
            <div className="shrink-0">
              <DeleteThreadButton threadId={thread.id} categorySlug={slug} />
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {thread.author.username ?? thread.author.name}
          </span>
          <span>·</span>
          <span title={formatDate(thread.createdAt)}>
            {formatDistanceToNow(thread.createdAt)}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {thread.viewCount} görüntülenme
          </span>
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-4">
        {thread.posts.map((post, index) => (
          <div
            key={post.id}
            className="rounded-lg border bg-card p-5"
            id={`post-${post.id}`}
          >
            {/* Post author */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {(post.author.username ?? post.author.name).charAt(0).toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/u/${post.author.username ?? post.author.name}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {post.author.username ?? post.author.name}
                  </Link>
                  {index === 0 && (
                    <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                      Konu Yazarı
                    </span>
                  )}
                </div>
              </div>
              <span
                className="text-xs text-muted-foreground"
                title={formatDate(post.createdAt)}
              >
                {formatDistanceToNow(post.createdAt)}
                {post.editedAt && ' (düzenlendi)'}
              </span>
            </div>

            {/* Post content */}
            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground">
              {post.content.split('\n').map((line, i) => (
                <p key={i} className={line === '' ? 'my-2' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Reply placeholder — DRA-16'da eklenecek */}
      {thread.isLocked ? (
        <div className="mt-6 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          <Lock className="mx-auto mb-2 h-4 w-4" />
          Bu konu kilitli. Yeni yanıt eklenemez.
        </div>
      ) : session ? (
        <div className="mt-6 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Yanıt formu yakında eklenecek.
        </div>
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
