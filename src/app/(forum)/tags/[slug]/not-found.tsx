import Link from 'next/link'
import { Tag } from 'lucide-react'
import { buttonVariants } from '@/lib/buttonVariants'

export default function TagNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <Tag className="h-12 w-12 text-muted-foreground/40" />
      <div>
        <h1 className="text-xl font-semibold">Etiket bulunamadı</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bu etiket mevcut değil veya silinmiş olabilir.</p>
      </div>
      <Link href="/" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        Ana Sayfaya Dön
      </Link>
    </div>
  )
}
