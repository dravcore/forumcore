import { NextResponse } from 'next/server'
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

export async function GET() {
  const [threads, settings] = await Promise.all([
    db.thread.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        author: { select: { name: true } },
        category: { select: { slug: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.siteSettings.findUnique({ where: { id: 'default' } }),
  ])

  const base = env.NEXT_PUBLIC_APP_URL
  const siteName = settings?.siteName ?? 'ForumCore'
  const siteDescription = settings?.siteDescription ?? ''

  const items = threads.map((t) => {
    const link = `${base}/c/${t.category.slug}/${t.slug}`
    return `
    <item>
      <title>${escapeXml(t.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${t.createdAt.toUTCString()}</pubDate>
      <author>${escapeXml(t.author.name)}</author>
      <category>${escapeXml(t.category.name)}</category>
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${base}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>tr</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
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
