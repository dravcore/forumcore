'use client'

import { useState, useTransition } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { createReport } from '@/server/actions/reportActions'

interface ReportButtonProps {
  targetType: 'POST' | 'THREAD' | 'USER'
  targetId: string
}

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await createReport({ targetType, targetId, reason })
      if (!result.success) { setError(result.error); return }
      setDone(true)
      setTimeout(() => { setOpen(false); setDone(false); setReason('') }, 1500)
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Raporla"
        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
      >
        <Flag className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>İçeriği Raporla</DialogTitle>
          </DialogHeader>

          {done ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Raporunuz iletildi. Teşekkürler.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="report-reason">Sebep</Label>
                <Textarea
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Bu içeriği neden uygunsuz bulduğunuzu açıklayın..."
                  rows={4}
                  className="resize-none text-sm"
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            </div>
          )}

          {!done && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                İptal
              </Button>
              <Button onClick={handleSubmit} disabled={isPending || reason.length < 10}>
                {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Gönder
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
