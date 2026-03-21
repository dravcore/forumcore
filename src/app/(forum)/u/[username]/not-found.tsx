import Link from 'next/link'
import { UserX } from 'lucide-react'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'

export default function UserNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 text-center">
      <UserX className="h-12 w-12 text-muted-foreground/50" />
      <div>
        <h1 className="text-xl font-semibold">Kullanıcı bulunamadı</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bu kullanıcı mevcut değil.</p>
      </div>
      <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>Ana sayfaya dön</Link>
    </div>
  )
}
