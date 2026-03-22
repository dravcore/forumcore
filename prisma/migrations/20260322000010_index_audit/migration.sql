-- Index audit: add missing indexes identified during slow query review

-- threads: category + deletedAt + updatedAt (main category listing query)
CREATE INDEX IF NOT EXISTS "threads_categoryId_deletedAt_updatedAt_idx"
  ON "threads"("categoryId", "deletedAt", "updatedAt" DESC);

-- posts: threadId + deletedAt (post listing within thread)
CREATE INDEX IF NOT EXISTS "posts_threadId_deletedAt_createdAt_idx"
  ON "posts"("threadId", "deletedAt", "createdAt" ASC);

-- notifications: userId + isRead + createdAt (bell query)
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_createdAt_idx"
  ON "notifications"("userId", "isRead", "createdAt" DESC);

-- reactions: postId + type (reaction count per type)
CREATE INDEX IF NOT EXISTS "reactions_postId_type_idx"
  ON "reactions"("postId", "type");

-- audit_logs: action + createdAt (filtered admin queries)
CREATE INDEX IF NOT EXISTS "audit_logs_action_createdAt_idx"
  ON "audit_logs"("action", "createdAt" DESC);

-- reports: resolvedAt + createdAt (open report queue)
CREATE INDEX IF NOT EXISTS "reports_resolvedAt_createdAt_idx"
  ON "reports"("resolvedAt", "createdAt" DESC);
