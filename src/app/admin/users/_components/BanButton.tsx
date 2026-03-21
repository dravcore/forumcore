'use client'

import { useState, useTransition } from 'react'
import { Ban, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { banUser, unbanUser } from '@/server/actions/userActions'

interface BanButtonProps {
  userId: string
  isBanned: boolean
}

export function BanButton({ userId, isBanned }: BanButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleUnban() {
    startTransition(async () => {
      await unbanUser(userId)
    })
  }

  function handleBan() {
    setError(null)
    startTransition(async () => {
      const result = await banUser(userId, reason)
      if (!result.success) { setError(result.error); return }
      setOpen(false)
      setReason('')
    })
  }

  if (isBanned) {
    return (
      <Button size="sm" variant="outline" onClick={handleUnban} disabled={isPending} className="gap-1.5 text-xs">
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
        Yasağı Kaldır
      </Button>
    )
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5 text-xs text-destructive hover:border-destructive hover:text-destructive">
        <Ban className="h-3 w-3" />
        Engelle
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Engelle</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="ban-reason">Engelleme Sebebi</Label>
            <Input
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Sebep girin..."
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>İptal</Button>
            <Button variant="destructive" onClick={handleBan} disabled={isPending || !reason.trim()}>
              {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Engelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
