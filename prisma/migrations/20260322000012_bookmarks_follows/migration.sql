-- Bookmarks
CREATE TABLE "bookmarks" (
  "id"        TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId"    TEXT NOT NULL,
  "threadId"  TEXT NOT NULL,
  CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "bookmarks_userId_threadId_key" ON "bookmarks"("userId","threadId");
CREATE INDEX "bookmarks_userId_createdAt_idx" ON "bookmarks"("userId","createdAt" DESC);
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey"  FOREIGN KEY ("userId")   REFERENCES "users"("id")   ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- User follows
CREATE TABLE "user_follows" (
  "followerId"  TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_follows_pkey" PRIMARY KEY ("followerId","followingId")
);
CREATE INDEX "user_follows_followerId_idx"  ON "user_follows"("followerId");
CREATE INDEX "user_follows_followingId_idx" ON "user_follows"("followingId");
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followerId_fkey"  FOREIGN KEY ("followerId")  REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Category subscriptions
CREATE TABLE "category_subscriptions" (
  "userId"     TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "category_subscriptions_pkey" PRIMARY KEY ("userId","categoryId")
);
CREATE INDEX "category_subscriptions_userId_idx" ON "category_subscriptions"("userId");
ALTER TABLE "category_subscriptions" ADD CONSTRAINT "category_subscriptions_userId_fkey"     FOREIGN KEY ("userId")     REFERENCES "users"("id")      ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "category_subscriptions" ADD CONSTRAINT "category_subscriptions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
