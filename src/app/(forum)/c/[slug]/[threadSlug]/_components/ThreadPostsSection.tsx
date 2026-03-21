'use client'

import { useState } from 'react'
import { PostItem } from './PostItem'
import { ReplyForm } from './ReplyForm'

interface Post {
  id: string
  content: string
  editedAt: Date | null
  createdAt: Date
  author: { id: string; name: string; username: string | null }
  _count: { reactions: number }
  reactions: { id: string }[]
}

interface ThreadPostsSectionProps {
  posts: Post[]
  firstPostGlobalIndex: number
  threadAuthorId: string
  sessionUserId?: string
  isMod: boolean
  isLoggedIn: boolean
  isLocked: boolean
  threadId: string
  categorySlug: string
  threadSlug: string
}

export function ThreadPostsSection({
  posts,
  firstPostGlobalIndex,
  threadAuthorId,
  sessionUserId,
  isMod,
  isLoggedIn,
  isLocked,
  threadId,
  categorySlug,
  threadSlug,
}: ThreadPostsSectionProps) {
  const [quoteText, setQuoteText] = useState('')

  return (
    <>
      <div className="flex flex-col gap-4">
        {posts.map((post, index) => {
          const canEditPost = !!(sessionUserId && (sessionUserId === post.author.id || isMod))
          return (
            <PostItem
              key={post.id}
              post={post}
              isOP={firstPostGlobalIndex + index === 0}
              canEdit={canEditPost}
              isLoggedIn={isLoggedIn}
              categorySlug={categorySlug}
              threadSlug={threadSlug}
              onQuote={!isLocked ? setQuoteText : undefined}
            />
          )
        })}
      </div>

      {!isLocked && isLoggedIn && (
        <ReplyForm
          threadId={threadId}
          categorySlug={categorySlug}
          threadSlug={threadSlug}
          initialContent={quoteText}
          onQuoteConsumed={() => setQuoteText('')}
        />
      )}
    </>
  )
}
