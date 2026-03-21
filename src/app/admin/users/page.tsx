import { Users } from 'lucide-react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getAdminUsers } from '@/server/queries/adminUserQueries'
import { formatDistanceToNow } from '@/lib/dateUtils'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'
import { UserRoleSelect } from './_components/UserRoleSelect'
import { BanButton } from './_components/BanButton'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MODERATOR: 'Moderatör',
  MEMBER: 'Üye',
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { users, total, pageCount } = await getAdminUsers(page)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Kullanıcılar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{total} kullanıcı</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Users className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Henüz kullanıcı yok</p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{user.name}</span>
                  {user.username && (
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                  )}
                  {user.bannedAt && (
                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive">
                      Engelli
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user._count.threads} konu · {user._count.posts} yanıt · {formatDistanceToNow(user.createdAt)} üye
                </p>
                {user.bannedReason && (
                  <p className="text-xs text-destructive">Sebep: {user.bannedReason}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <UserRoleSelect userId={user.id} currentRole={user.role} />
                <BanButton userId={user.id} isBanned={!!user.bannedAt} />
              </div>
            </div>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/admin/users?page=${page - 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              <ChevronLeft className="h-4 w-4" />Önceki
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{page} / {pageCount}</span>
          {page < pageCount && (
            <Link href={`/admin/users?page=${page + 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Sonraki<ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
