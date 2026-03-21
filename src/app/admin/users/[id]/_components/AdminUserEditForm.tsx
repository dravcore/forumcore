'use client'

import { useState } from 'react'
import { adminUpdateUser } from '@/server/actions/userActions'

type User = {
  id: string
  name: string
  username: string | null
  email: string
}

export function AdminUserEditForm({ user }: { user: User }) {
  const [form, setForm] = useState({
    name: user.name,
    username: user.username ?? '',
    email: user.email,
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setError(null)
    const result = await adminUpdateUser(user.id, form)
    if (!result.success) {
      setError(result.error)
      setStatus('error')
      return
    }
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Ad Soyad</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          maxLength={64}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Kullanıcı Adı</label>
        <div className="flex items-center">
          <span className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">@</span>
          <input
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            required
            minLength={3}
            maxLength={32}
            pattern="^[a-zA-Z0-9_]+$"
            className="h-10 w-full rounded-l-none rounded-r-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {status === 'saving' ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {status === 'saved' && <p className="text-sm text-green-600">Kaydedildi</p>}
      </div>
    </form>
  )
}
