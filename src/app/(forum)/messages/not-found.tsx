import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { buttonVariants } from '@/lib/buttonVariants'

export default function MessageNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <MessageCircle className="h-12 w-12 text-muted-foreground/40" />
      <div>
        <h1 className="text-xl font-semibold">Konuşma bulunamadı</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bu konuşma mevcut değil.</p>
      </div>
      <Link href="/messages" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        Gelen Kutusuna Dön
      </Link>
    </div>
  )
}
