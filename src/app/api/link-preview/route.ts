import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { cacheGet, cacheSet } from '@/lib/redis'

// Block private IP ranges (SSRF protection)
const PRIVATE_IP = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1|localhost)/i

function isPrivateUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return PRIVATE_IP.test(hostname)
  } catch {
    return true
  }
}

function extractMeta(html: string) {
  const get = (property: string) => {
    const m =
      html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, 'i'))
    return m?.[1] ?? null
  }
  const title =
    get('title') ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
    null
  return {
    title: title?.trim().slice(0, 200) ?? null,
    description: get('description')?.trim().slice(0, 400) ?? null,
    image: get('image') ?? null,
  }
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url parametresi gerekli' }, { status: 400 })

  if (isPrivateUrl(url)) {
    return NextResponse.json({ error: 'Geçersiz URL' }, { status: 400 })
  }

  const cacheKey = `link-preview:${url}`
  const cached = await cacheGet<object>(cacheKey)
  if (cached) return NextResponse.json(cached)

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ForumCore/1.0 (+https://forum)' },
      signal: AbortSignal.timeout(5000),
    })
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) {
      return NextResponse.json({ title: url, description: null, image: null })
    }
    const html = await res.text()
    const meta = extractMeta(html)
    void cacheSet(cacheKey, meta, 3600)
    return NextResponse.json(meta)
  } catch {
    return NextResponse.json({ title: url, description: null, image: null })
  }
}
