'use client'

import { useTransition } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resolveReport } from '@/server/actions/reportActions'

export function ResolveButton({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleResolve() {
    startTransition(async () => {
      await resolveReport(reportId)
    })
  }

  return (
    <Button size="sm" variant="outline" onClick={handleResolve} disabled={isPending}>
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
      Çözüldü
    </Button>
  )
}
