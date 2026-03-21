import { getSiteSettings } from '@/server/actions/siteSettingsActions'
import { SiteSettingsForm } from './_components/SiteSettingsForm'

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Site Ayarları</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Platform genelindeki ayarları yönet</p>
      </div>
      <div className="max-w-lg">
        <SiteSettingsForm settings={settings} />
      </div>
    </div>
  )
}
