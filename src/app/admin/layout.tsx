export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { LayoutGrid, Shield } from 'lucide-react'
import { requireAdmin } from '@/lib/session'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold">Admin Paneli</span>
        </div>
        <nav className="ml-2 flex gap-1">
          <Link
            href="/admin/categories"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Kategoriler
          </Link>
        </nav>
      </div>
      {children}
    </div>
  )
}
