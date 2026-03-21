import { MessageSquare, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Topluluğa Hoş Geldiniz
        </h1>
        <p className="mt-3 text-muted-foreground">
          Sorularını sor, deneyimlerini paylaş, topluluğa katkıda bulun.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-3 gap-4 rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center gap-1">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-bold">0</span>
          <span className="text-xs text-muted-foreground">Üye</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-x">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-bold">0</span>
          <span className="text-xs text-muted-foreground">Konu</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-bold">0</span>
          <span className="text-xs text-muted-foreground">Yanıt</span>
        </div>
      </div>

      {/* Categories placeholder */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Kategoriler</h2>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
