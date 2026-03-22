'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User, MessageCircle } from 'lucide-react'
import { useSession, signOut } from '@/lib/auth-client'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'
import { NotificationBell } from './NotificationBell'

export function NavbarUser() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  if (isPending) {
    return <div className="h-7 w-28 animate-pulse rounded-md bg-muted" />
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <NotificationBell initialCount={0} />
        <Link
          href="/messages"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          aria-label="Özel Mesajlar"
        >
          <MessageCircle className="h-4 w-4" />
        </Link>
        <Link
          href={`/u/${session.user.name}`}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <User className="h-4 w-4" />
          {session.user.name}
        </Link>
        <button
          onClick={handleSignOut}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          aria-label="Çıkış yap"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
        Giriş Yap
      </Link>
      <Link href="/register" className={cn(buttonVariants({ size: 'sm' }))}>
        Kayıt Ol
      </Link>
    </div>
  )
}
