import type { Metadata } from 'next'
import Link from 'next/link'
import { Flame, MessageSquare, Eye, TrendingUp } from 'lucide-react'
import { getHotThreads } from '@/server/queries/searchQueries'
import { db } from '@/lib/db'
import { formatDistanceToNow } from '@/lib/dateUtils'

export const metadata: Metadata = {
  title: 'Keşfet — Trend Konular',
}

export const revalidate = 300 // refresh every 5 min

export default async function ExplorePage() {
  const [hotThreads, categories] = await Promise.all([
    getHotThreads(30),
    db.category.findMany({
      select: { id: true, name: true, slug: true, _count: { select: { threads: true } } },
      orderBy: { order: 'asc' },
    }),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Keşfet</h1>
          <p className="text-sm text-muted-foreground">Toplulukta trend olan konular</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Hot threads */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Flame className="h-4 w-4 text-orange-500" />
            Trend Konular
          </h2>
          {hotThreads.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Henüz içerik yok. İlk konuyu sen açabilirsin!
            </div>
          ) : (
            <div className="space-y-2">
              {hotThreads.map((thread, i) => (
                <Link
                  key={thread.id}
                  href={`/c/${thread.categorySlug}/${thread.slug}`}
                  className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{thread.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-0.5">{thread.categoryName}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />{thread.postCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />{thread.viewCount}
                      </span>
                      <span>{thread.authorName} · {formatDistanceToNow(thread.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Categories sidebar */}
        <aside>
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Kategoriler
          </h2>
          <div className="rounded-lg border bg-card">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className={`flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-accent/50 ${
                  i !== categories.length - 1 ? 'border-b' : ''
                }`}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c._count.threads} konu</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
