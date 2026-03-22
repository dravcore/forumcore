import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageSquare, Rss } from 'lucide-react'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatDistanceToNow } from '@/lib/dateUtils'

export const metadata: Metadata = { title: 'Akışım' }
export const dynamic = 'force-dynamic'

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login?callbackUrl=/feed')

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const PAGE_SIZE = 20

  // Get followed user IDs and subscribed category IDs
  const [follows, subscriptions] = await Promise.all([
    db.userFollow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    }),
    db.categorySubscription.findMany({
      where: { userId: session.user.id },
      select: { categoryId: true },
    }),
  ])

  const followedIds = follows.map((f) => f.followingId)
  const subscribedCategoryIds = subscriptions.map((s) => s.categoryId)

  const hasSubscriptions = followedIds.length > 0 || subscribedCategoryIds.length > 0

  const [threads, total] = hasSubscriptions
    ? await Promise.all([
        db.thread.findMany({
          where: {
            deletedAt: null,
            OR: [
              { authorId: { in: followedIds } },
              { categoryId: { in: subscribedCategoryIds } },
            ],
          },
          select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
            category: { select: { slug: true, name: true } },
            author: { select: { name: true, username: true } },
            _count: { select: { posts: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
        db.thread.count({
          where: {
            deletedAt: null,
            OR: [
              { authorId: { in: followedIds } },
              { categoryId: { in: subscribedCategoryIds } },
            ],
          },
        }),
      ])
    : [[], 0]

  const pageCount = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Rss className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Akışım</h1>
          <p className="text-sm text-muted-foreground">
            Takip ettiğin kişiler ve abone olduğun kategoriler
          </p>
        </div>
      </div>

      {!hasSubscriptions ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <Rss className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">Akışınız boş</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Kullanıcıları takip edin veya kategorilere abone olun.
            </p>
          </div>
          <Link
            href="/explore"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Keşfet
          </Link>
        </div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">Takip ettiğiniz kaynaklarda yeni konu yok.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {threads.map((t) => (
              <Link
                key={t.id}
                href={`/c/${t.category.slug}/${t.slug}`}
                className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5">{t.category.name}</span>
                    <span>{t.author.username ?? t.author.name}</span>
                    <span>·</span>
                    <span>{t._count.posts} yanıt</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(t.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              {page > 1 && (
                <Link href={`/feed?page=${page - 1}`} className="rounded-md border px-3 py-1.5 hover:bg-accent">
                  Önceki
                </Link>
              )}
              <span className="text-muted-foreground">{page} / {pageCount}</span>
              {page < pageCount && (
                <Link href={`/feed?page=${page + 1}`} className="rounded-md border px-3 py-1.5 hover:bg-accent">
                  Sonraki
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
