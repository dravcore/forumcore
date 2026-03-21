'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Bir Hata Oluştu</h1>
        <p className="text-muted-foreground">
          Beklenmedik bir hata meydana geldi. Lütfen tekrar dene.
        </p>
      </div>
      <Button onClick={reset}>Tekrar Dene</Button>
    </div>
  )
}
