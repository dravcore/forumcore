export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { LayoutGrid, Shield, Flag, Users, BarChart2, Settings, Tag } from 'lucide-react'
import { requireAdmin } from '@/lib/session'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold">Admin Paneli</span>
        </div>
        <nav className="flex flex-wrap gap-1">
          <Link href="/admin" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <BarChart2 className="h-3.5 w-3.5" />Dashboard
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <LayoutGrid className="h-3.5 w-3.5" />Kategoriler
          </Link>
          <Link href="/admin/users" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Users className="h-3.5 w-3.5" />Kullanıcılar
          </Link>
          <Link href="/admin/tags" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Tag className="h-3.5 w-3.5" />Etiketler
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Flag className="h-3.5 w-3.5" />Raporlar
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Settings className="h-3.5 w-3.5" />Ayarlar
          </Link>
        </nav>
      </div>
      {children}
    </div>
  )
}
