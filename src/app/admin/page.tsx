import Link from 'next/link'
import { Users, MessageSquare, FileText, TrendingUp, Activity } from 'lucide-react'
import { getDashboardStats } from '@/server/queries/adminUserQueries'
import { formatDistanceToNow } from '@/lib/dateUtils'

export default async function AdminPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Genel platform istatistikleri</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Toplam Kullanıcı" value={stats.totalUsers} sub={`+${stats.newUsersToday} bugün`} />
        <StatCard icon={MessageSquare} label="Toplam Konu" value={stats.totalThreads} />
        <StatCard icon={FileText} label="Toplam Yanıt" value={stats.totalPosts} sub={`+${stats.newPostsToday} bugün`} />
        <StatCard icon={TrendingUp} label="Aktif Kategori" value={stats.activeCategories.length} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top categories */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-sm font-semibold">En Aktif Kategoriler</h2>
          {stats.activeCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz kategori yok</p>
          ) : (
            <div className="space-y-2">
              {stats.activeCategories.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <Link href={`/c/${c.slug}`} className="text-muted-foreground hover:text-foreground">
                    {c.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">{c._count.threads} konu</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold">
            <Activity className="h-4 w-4" />
            Son Aktiviteler
          </h2>
          {stats.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz aktivite yok</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((p) => (
                <div key={p.id} className="text-sm">
                  <Link
                    href={`/c/${p.thread.category.slug}/${p.thread.slug}`}
                    className="line-clamp-1 font-medium hover:underline"
                  >
                    {p.thread.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.author.name} · {formatDistanceToNow(p.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: number
  sub?: string
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value.toLocaleString('tr-TR')}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}
