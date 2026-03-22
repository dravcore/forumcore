import { requireAuth } from '@/lib/session'
import { getMyApiKeys } from '@/server/actions/apiKeyActions'
import { ApiKeyManager } from './_components/ApiKeyManager'

export default async function ApiKeysPage() {
  await requireAuth()
  const keys = await getMyApiKeys()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">API Anahtarları</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kişisel API anahtarlarınızı yönetin. Anahtarlar{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">Authorization: Bearer &lt;key&gt;</code>{' '}
          başlığıyla kullanılır.
        </p>
      </div>
      <ApiKeyManager initialKeys={keys} />
    </div>
  )
}
