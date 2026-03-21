import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { db } from '@/lib/db'
import { AdminUserEditForm } from './_components/AdminUserEditForm'

export default async function AdminUserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, username: true, email: true, role: true, bannedAt: true },
  })

  if (!user) notFound()

  return (
    <div>
      <Link href="/admin/users" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-3.5 w-3.5" />Kullanıcılara dön
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Kullanıcı Düzenle</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>
      </div>
      <div className="max-w-md">
        <AdminUserEditForm user={user} />
      </div>
    </div>
  )
}
