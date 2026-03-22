import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { env } from '@/env'

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const category = await db.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  })

  if (!category) {
    return new NextResponse('Category not found', { status: 404 })
  }

  const threads = await db.thread.findMany({
    where: { deletedAt: null, categoryId: category.id },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      author: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const base = env.NEXT_PUBLIC_APP_URL
  const feedUrl = `${base}/c/${slug}/feed.xml`

  const items = threads.map((t) => {
    const link = `${base}/c/${slug}/${t.slug}`
    return `
    <item>
      <title>${escapeXml(t.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${t.createdAt.toUTCString()}</pubDate>
      <author>${escapeXml(t.author.name)}</author>
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(category.name)}</title>
    <link>${base}/c/${slug}</link>
    <description>${escapeXml(category.name)} kategorisindeki son konular</description>
    <language>tr</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
