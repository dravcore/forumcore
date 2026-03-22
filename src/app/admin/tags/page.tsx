import type { Metadata } from 'next'
import { Tag } from 'lucide-react'
import { getAllTags } from '@/server/queries/tagQueries'
import { TagCreateForm } from './_components/TagCreateForm'
import { TagItem } from './_components/TagItem'

export const metadata: Metadata = {
  title: 'Etiketler — Admin',
}

export default async function AdminTagsPage() {
  const tags = await getAllTags()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Etiketler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Forum etiketlerini buradan yönetebilirsin. Etiketler konu oluştururken seçilebilir.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 text-sm font-medium">Yeni Etiket</h2>
        <TagCreateForm />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Mevcut Etiketler ({tags.length})
        </h2>

        {tags.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
            <Tag className="h-8 w-8 text-muted-foreground/50" />
            <div>
              <p className="font-medium text-muted-foreground">Henüz etiket yok</p>
              <p className="mt-1 text-sm text-muted-foreground">Yukarıdan ilk etiketi ekle.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tags.map((tag) => (
              <TagItem key={tag.id} tag={tag} allTags={tags} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
