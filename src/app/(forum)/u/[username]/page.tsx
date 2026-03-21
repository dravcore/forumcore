import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  CalendarDays, MessageSquare, Globe, Twitter, Github,
  FileText, Shield, User, Pencil,
} from 'lucide-react'
import { getUserByUsername, getUserRecentThreads, getUserRecentPosts } from '@/server/queries/userQueries'
import { getSession } from '@/lib/session'
import { formatDate, formatDistanceToNow } from '@/lib/dateUtils'
import { buttonVariants } from '@/lib/buttonVariants'
import { cn } from '@/lib/utils'

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await getUserByUsername(username)
  if (!user) return { title: 'Kullanıcı bulunamadı' }
  return { title: `${user.username ?? user.name} — Profil` }
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params

  const [user, session] = await Promise.all([getUserByUsername(username), getSession()])
  if (!user) notFound()

  const displayName = user.username ?? user.name
  const isOwner = session?.user.id === user.id

  const [recentThreads, recentPosts] = await Promise.all([
    getUserRecentThreads(user.id),
    getUserRecentPosts(user.id),
  ])

  const roleLabel = user.role === 'ADMIN' ? 'Admin' : user.role === 'MODERATOR' ? 'Moderatör' : null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Avatar + name */}
          <div className="rounded-lg border bg-card p-5 text-center">
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={displayName} width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h1 className="text-lg font-semibold">{displayName}</h1>
            {roleLabel && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Shield className="h-3 w-3" />{roleLabel}
              </span>
            )}
            {isOwner && (
              <Link href="/u/edit" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-3 w-full')}>
                <Pencil className="h-3.5 w-3.5" />Profili Düzenle
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" />Konu</span>
              <span className="font-medium">{user._count.threads}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="h-4 w-4" />Yanıt</span>
              <span className="font-medium">{user._count.posts}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />Katılım</span>
              <span className="font-medium text-xs">{formatDate(user.createdAt)}</span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Social links */}
          {(user.websiteUrl || user.twitterHandle || user.githubHandle) && (
            <div className="rounded-lg border bg-card p-4 space-y-2">
              {user.websiteUrl && (
                <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground truncate">
                  <Globe className="h-4 w-4 shrink-0" />
                  {user.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              )}
              {user.twitterHandle && (
                <a href={`https://twitter.com/${user.twitterHandle}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Twitter className="h-4 w-4 shrink-0" />@{user.twitterHandle}
                </a>
              )}
              {user.githubHandle && (
                <a href={`https://github.com/${user.githubHandle}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Github className="h-4 w-4 shrink-0" />{user.githubHandle}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {/* Recent Threads */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <FileText className="h-4 w-4" />SON KONULAR
            </h2>
            {recentThreads.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Henüz konu açılmamış.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentThreads.map((thread) => (
                  <Link key={thread.id} href={`/c/${thread.category.slug}/${thread.slug}`}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 hover:bg-accent/40 transition-colors group">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-primary">{thread.title}</p>
                      <p className="text-xs text-muted-foreground">{thread.category.name} · {formatDistanceToNow(thread.createdAt)}</p>
                    </div>
                    <span className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />{Math.max(0, thread._count.posts - 1)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Posts */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <MessageSquare className="h-4 w-4" />SON YANITLAR
            </h2>
            {recentPosts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Henüz yanıt yazılmamış.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentPosts.map((post) => (
                  <Link key={post.id} href={`/c/${post.thread.category.slug}/${post.thread.slug}`}
                    className="rounded-lg border bg-card p-3 hover:bg-accent/40 transition-colors group">
                    <p className="mb-1 truncate text-xs font-medium text-muted-foreground group-hover:text-primary">{post.thread.title}</p>
                    <p className="line-clamp-2 text-sm text-foreground/80">{post.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDistanceToNow(post.createdAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
