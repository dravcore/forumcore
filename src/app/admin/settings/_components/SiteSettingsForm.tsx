'use client'

import { useState } from 'react'
import { updateSiteSettings } from '@/server/actions/siteSettingsActions'

type Settings = {
  siteName: string
  siteDescription: string
  registrationOpen: boolean
}

export function SiteSettingsForm({ settings }: { settings: Settings }) {
  const [form, setForm] = useState(settings)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    const result = await updateSiteSettings(form)
    setStatus(result.success ? 'saved' : 'error')
    setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Site Adı</label>
        <input
          value={form.siteName}
          onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))}
          maxLength={64}
          required
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Site Açıklaması</label>
        <textarea
          value={form.siteDescription}
          onChange={(e) => setForm((f) => ({ ...f, siteDescription: e.target.value }))}
          maxLength={256}
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium">Kayıt</p>
          <p className="text-xs text-muted-foreground">Yeni kullanıcı kaydına izin ver</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.registrationOpen}
          onClick={() => setForm((f) => ({ ...f, registrationOpen: !f.registrationOpen }))}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            form.registrationOpen ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg transition-transform ${
              form.registrationOpen ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
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
        {status === 'error' && <p className="text-sm text-destructive">Hata oluştu</p>}
      </div>
    </form>
  )
}
