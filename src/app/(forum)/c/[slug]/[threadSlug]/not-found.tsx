import Link from 'next/link'
import { MessageSquareOff } from 'lucide-react'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'

export default function ThreadNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 text-center">
      <MessageSquareOff className="h-12 w-12 text-muted-foreground/50" />
      <div>
        <h1 className="text-xl font-semibold">Konu bulunamadı</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bu konu mevcut değil ya da silinmiş olabilir.</p>
      </div>
      <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>Ana sayfaya dön</Link>
    </div>
  )
}
