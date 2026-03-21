import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { ProfileForm } from './_components/ProfileForm'
import { AvatarUpload } from './_components/AvatarUpload'

export const metadata: Metadata = { title: 'Profili Düzenle' }

export default async function EditProfilePage() {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      websiteUrl: true,
      twitterHandle: true,
      githubHandle: true,
    },
  })

  if (!user) return null

  const displayName = user.username ?? user.name

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href={`/u/${displayName}`} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-3.5 w-3.5" />Profilime dön
      </Link>

      <h1 className="mb-8 text-2xl font-bold">Profili Düzenle</h1>

      <div className="space-y-8">
        {/* Avatar */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium">Profil Fotoğrafı</h2>
          <AvatarUpload currentAvatarUrl={user.avatarUrl} displayName={displayName} />
        </div>

        {/* Profile info */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium">Profil Bilgileri</h2>
          <ProfileForm
            defaultValues={{
              bio: user.bio ?? '',
              websiteUrl: user.websiteUrl ?? '',
              twitterHandle: user.twitterHandle ?? '',
              githubHandle: user.githubHandle ?? '',
            }}
          />
        </div>
      </div>
    </div>
  )
}
