import Link from 'next/link'
import { FolderX } from 'lucide-react'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'

export default function CategoryNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 text-center">
      <FolderX className="h-12 w-12 text-muted-foreground/50" />
      <div>
        <h1 className="text-xl font-semibold">Kategori bulunamadı</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bu kategori mevcut değil ya da kaldırılmış olabilir.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
        Ana sayfaya dön
      </Link>
    </div>
  )
}
