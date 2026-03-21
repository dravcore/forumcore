import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getCategoryBySlug } from '@/server/queries/categoryQueries'
import { getSession } from '@/lib/session'
import { NewThreadForm } from './_components/NewThreadForm'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Kategori bulunamadı' }
  return { title: `Yeni Konu — ${category.name}` }
}

export default async function NewThreadPage({ params }: Props) {
  const { slug } = await params
  const [category, session] = await Promise.all([getCategoryBySlug(slug), getSession()])
  if (!category) notFound()
  if (!session) redirect(`/login?callbackUrl=/c/${slug}/new`)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href={`/c/${slug}`} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-3.5 w-3.5" />{category.name}
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Yeni Konu</h1>
      <NewThreadForm categorySlug={slug} />
    </div>
  )
}
