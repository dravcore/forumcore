'use client'

import dynamic from 'next/dynamic'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false })
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false })

interface DailyStat {
  date: string
  dau: number
  newUsers: number
  newThreads: number
  newPosts: number
}

interface CategoryStat {
  id: string
  name: string
  slug: string
  threadCount: number
}

interface AnalyticsChartsProps {
  dailyStats: DailyStat[]
  categoryStats: CategoryStat[]
}

export function AnalyticsCharts({ dailyStats, categoryStats }: AnalyticsChartsProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)

  return (
    <div className="space-y-8">
      {/* Activity chart */}
      <div className="rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Son 30 Gün — Konu & Yanıt</h2>
          <a href={`/api/admin/analytics/export?month=${currentMonth}`} download>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              CSV İndir
            </Button>
          </a>
        </div>
        {dailyStats.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Henüz istatistik verisi yok</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  className="text-muted-foreground"
                />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  labelFormatter={(l) => `Tarih: ${String(l)}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="newThreads" name="Yeni Konu" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="newPosts" name="Yeni Yanıt" stroke="hsl(var(--chart-2, 217 91% 60%))" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* DAU chart */}
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-sm font-semibold">Günlük Aktif Kullanıcı (DAU)</h2>
        {dailyStats.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Henüz istatistik verisi yok</p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} labelFormatter={(l) => `Tarih: ${String(l)}`} />
                <Bar dataKey="dau" name="DAU" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category stats */}
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-sm font-semibold">Kategorilere Göre Konu Sayısı</h2>
        {categoryStats.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Henüz kategori yok</p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="threadCount" name="Konu" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
