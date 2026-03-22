'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTag } from '@/server/actions/tagActions'

export function TagCreateForm() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createTag({ name })
      if (!result.success) {
        setError(result.error)
      } else {
        setName('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="tag-name">Etiket Adı</Label>
        <Input
          id="tag-name"
          placeholder="ör: javascript, tanıtım, soru-cevap"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          aria-invalid={!!error}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <Button type="submit" disabled={isPending || name.trim().length < 2}>
        {isPending && <Loader2 className="animate-spin" />}
        Ekle
      </Button>
    </form>
  )
}
