'use client'

import { useState, useTransition } from 'react'
import { Key, Trash2, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createApiKey, revokeApiKey } from '@/server/actions/apiKeyActions'
import { formatDistanceToNow } from '@/lib/dateUtils'

interface ApiKey {
  id: string
  name: string
  createdAt: Date
  lastUsedAt: Date | null
  revokedAt: Date | null
}

interface Props {
  initialKeys: ApiKey[]
}

export function ApiKeyManager({ initialKeys }: Props) {
  const [keys, setKeys] = useState(initialKeys)
  const [name, setName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    setError(null)
    const fd = new FormData()
    fd.set('name', name)
    startTransition(async () => {
      const result = await createApiKey(fd)
      if (!result.success) { setError(result.error ?? 'Hata'); return }
      setNewKey(result.key ?? null)
      setName('')
      // Refresh by re-fetching would require router — optimistically add placeholder
      setKeys((prev) => [...prev, {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date(),
        lastUsedAt: null,
        revokedAt: null,
      }])
    })
  }

  function handleRevoke(id: string) {
    startTransition(async () => {
      const result = await revokeApiKey(id)
      if (!result.success) return
      setKeys((prev) => prev.map((k) => k.id === id ? { ...k, revokedAt: new Date() } : k))
    })
  }

  function handleCopy() {
    if (!newKey) return
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* New key revealed */}
      {newKey && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/5 p-4">
          <p className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
            API anahtarınız oluşturuldu — yalnızca bir kez gösterilir, kopyalayın!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-muted px-2 py-1.5 text-xs">{newKey}</code>
            <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={() => setNewKey(null)}>
            Kapat
          </Button>
        </div>
      )}

      {/* Create form */}
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="key-name">Yeni API Anahtarı</Label>
          <Input
            id="key-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ör: Mobil Uygulama"
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
          />
        </div>
        <Button onClick={handleCreate} disabled={isPending || !name.trim()}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
          Oluştur
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Key list */}
      {keys.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz API anahtarı yok.</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center gap-3 px-4 py-3">
              <Key className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{k.name}</p>
                <p className="text-xs text-muted-foreground">
                  Oluşturuldu {formatDistanceToNow(k.createdAt)}
                  {k.lastUsedAt && ` · Son kullanım ${formatDistanceToNow(k.lastUsedAt)}`}
                </p>
              </div>
              {k.revokedAt ? (
                <span className="text-xs text-muted-foreground">İptal edildi</span>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRevoke(k.id)}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
