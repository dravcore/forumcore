import type { Metadata } from 'next'
import { LayoutGrid } from 'lucide-react'
import { getCategories } from '@/server/queries/categoryQueries'
import { CategoryForm } from './_components/CategoryForm'
import { CategoryItem } from './_components/CategoryItem'

export const metadata: Metadata = {
  title: 'Kategoriler — Admin',
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Kategoriler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Forum kategorilerini buradan yönetebilirsin.
        </p>
      </div>

      {/* Yeni Kategori */}
      <div className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 text-sm font-medium">Yeni Kategori</h2>
        <CategoryForm />
      </div>

      {/* Liste */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Mevcut Kategoriler ({categories.length})
        </h2>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
            <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
            <div>
              <p className="font-medium text-muted-foreground">Henüz kategori yok</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Yukarıdan ilk kategorini ekle.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                isFirst={index === 0}
                isLast={index === categories.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
