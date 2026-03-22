import type { Metadata } from 'next'
import Link from 'next/link'
import { Trophy, Medal, MessageSquare, Star } from 'lucide-react'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'Liderlik Tablosu' }
export const revalidate = 600

export default async function LeaderboardPage() {
  const [topByRep, topByPosts, topByThreads] = await Promise.all([
    db.user.findMany({
      where: { bannedAt: null },
      select: {
        id: true, name: true, username: true, reputation: true, trustLevel: true,
        _count: { select: { posts: true, threads: true } },
      },
      orderBy: { reputation: 'desc' },
      take: 10,
    }),
    db.user.findMany({
      where: { bannedAt: null },
      select: {
        id: true, name: true, username: true, reputation: true,
        _count: { select: { posts: true } },
      },
      orderBy: { posts: { _count: 'desc' } },
      take: 10,
    }),
    db.user.findMany({
      where: { bannedAt: null },
      select: {
        id: true, name: true, username: true, reputation: true,
        _count: { select: { threads: true } },
      },
      orderBy: { threads: { _count: 'desc' } },
      take: 10,
    }),
  ])

  const rankIcon = (i: number) => {
    if (i === 0) return <Trophy className="h-4 w-4 text-amber-500" />
    if (i === 1) return <Medal className="h-4 w-4 text-gray-400" />
    if (i === 2) return <Medal className="h-4 w-4 text-amber-700" />
    return <span className="w-4 text-center text-xs text-muted-foreground">{i + 1}</span>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Trophy className="h-6 w-6 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold">Liderlik Tablosu</h1>
          <p className="text-sm text-muted-foreground">En aktif ve en çok beğenilen üyeler</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Top by reputation */}
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Star className="h-3.5 w-3.5 text-amber-500" />En Çok İtibar
          </h2>
          <div className="rounded-lg border bg-card divide-y">
            {topByRep.map((u, i) => (
              <Link
                key={u.id}
                href={`/u/${u.username ?? u.name}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">{rankIcon(i)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{u.username ?? u.name}</p>
                  <p className="text-xs text-muted-foreground">İtibar: {u.reputation}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top by posts */}
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <MessageSquare className="h-3.5 w-3.5 text-blue-500" />En Çok Yanıt
          </h2>
          <div className="rounded-lg border bg-card divide-y">
            {topByPosts.map((u, i) => (
              <Link
                key={u.id}
                href={`/u/${u.username ?? u.name}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">{rankIcon(i)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{u.username ?? u.name}</p>
                  <p className="text-xs text-muted-foreground">{u._count.posts} yanıt</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top by threads */}
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />En Çok Konu
          </h2>
          <div className="rounded-lg border bg-card divide-y">
            {topByThreads.map((u, i) => (
              <Link
                key={u.id}
                href={`/u/${u.username ?? u.name}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">{rankIcon(i)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{u.username ?? u.name}</p>
                  <p className="text-xs text-muted-foreground">{u._count.threads} konu</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
