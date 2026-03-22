import { Users, MessageSquare, FileText, LayoutGrid } from 'lucide-react'
import { getForumStats, getDailyStats, getCategoryStats, getTopAuthors } from '@/server/queries/analyticsQueries'
import { AnalyticsCharts } from './_components/AnalyticsCharts'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const [stats, dailyStats, categoryStats, topAuthors] = await Promise.all([
    getForumStats(),
    getDailyStats(30),
    getCategoryStats(),
    getTopAuthors(10),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Analitik</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Forum kullanım istatistikleri</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Toplam Kullanıcı" value={stats.totalUsers} />
        <StatCard icon={MessageSquare} label="Toplam Konu" value={stats.totalThreads} />
        <StatCard icon={FileText} label="Toplam Yanıt" value={stats.totalPosts} />
        <StatCard icon={LayoutGrid} label="Kategori" value={stats.totalCategories} />
      </div>

      {/* Charts */}
      <AnalyticsCharts dailyStats={dailyStats} categoryStats={categoryStats} />

      {/* Top authors */}
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-sm font-semibold">En Aktif Kullanıcılar</h2>
        {topAuthors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz kullanıcı yok</p>
        ) : (
          <div className="space-y-2">
            {topAuthors.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-right text-xs text-muted-foreground">{i + 1}</span>
                <Link
                  href={`/u/${u.username ?? u.id}`}
                  className="flex-1 font-medium hover:underline"
                >
                  {u.name}
                  {u.username && <span className="ml-1 text-xs text-muted-foreground">@{u.username}</span>}
                </Link>
                <span className="text-xs text-muted-foreground">{u.postCount} yanıt</span>
                <span className="text-xs text-muted-foreground">{u.reputation} puan</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value.toLocaleString('tr-TR')}</p>
    </div>
  )
}
