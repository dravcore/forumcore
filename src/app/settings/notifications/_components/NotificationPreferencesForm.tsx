'use client'

import { useState, useTransition } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { updateNotificationPreferences } from '@/server/actions/digestActions'

interface NotificationPreferencesFormProps {
  initialEmailNotifications: boolean
  initialDigestFrequency: 'off' | 'daily' | 'weekly'
}

export function NotificationPreferencesForm({
  initialEmailNotifications,
  initialDigestFrequency,
}: NotificationPreferencesFormProps) {
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications)
  const [digestFrequency, setDigestFrequency] = useState<'off' | 'daily' | 'weekly'>(initialDigestFrequency)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateNotificationPreferences({ emailNotifications, digestFrequency })
      if (!result.success) { setError(result.error ?? 'Hata'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">E-posta Bildirimleri</p>
          <p className="text-xs text-muted-foreground mt-0.5">Yanıt ve bahsetme bildirimlerini e-posta olarak al</p>
        </div>
        <button
          role="switch"
          aria-checked={emailNotifications}
          onClick={() => setEmailNotifications(!emailNotifications)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            emailNotifications ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            emailNotifications ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {emailNotifications && (
        <div>
          <p className="text-sm font-medium mb-2">Özet Sıklığı</p>
          <div className="space-y-2">
            {(['off', 'daily', 'weekly'] as const).map((freq) => (
              <label key={freq} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="digestFrequency"
                  value={freq}
                  checked={digestFrequency === freq}
                  onChange={() => setDigestFrequency(freq)}
                  className="h-4 w-4"
                />
                <span className="text-sm">
                  {freq === 'off' ? 'Kapalı' : freq === 'daily' ? 'Günlük özet' : 'Haftalık özet'}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : null}
        {saved ? 'Kaydedildi' : 'Kaydet'}
      </button>
    </div>
  )
}
