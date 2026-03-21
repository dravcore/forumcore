import Link from 'next/link'
import { buttonVariants } from '@/lib/buttonVariants'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Sayfa Bulunamadı</h1>
        <p className="text-muted-foreground">
          Aradığın sayfa mevcut değil veya taşınmış olabilir.
        </p>
      </div>
      <Link href="/" className={buttonVariants()}>
        Ana Sayfaya Dön
      </Link>
    </div>
  )
}
