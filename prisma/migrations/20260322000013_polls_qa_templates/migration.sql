-- Thread: Q&A mode + accepted answer
ALTER TABLE "threads" ADD COLUMN "isQA" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "threads" ADD COLUMN "acceptedPostId" TEXT;

-- Post edit history
CREATE TABLE "post_edit_history" (
  "id"       TEXT NOT NULL,
  "content"  TEXT NOT NULL,
  "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "postId"   TEXT NOT NULL,
  CONSTRAINT "post_edit_history_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "post_edit_history_postId_editedAt_idx" ON "post_edit_history"("postId","editedAt" DESC);
ALTER TABLE "post_edit_history" ADD CONSTRAINT "post_edit_history_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Polls
CREATE TABLE "polls" (
  "id"        TEXT NOT NULL,
  "question"  TEXT NOT NULL,
  "endsAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "threadId"  TEXT NOT NULL,
  CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "polls_threadId_key" ON "polls"("threadId");
ALTER TABLE "polls" ADD CONSTRAINT "polls_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Poll options
CREATE TABLE "poll_options" (
  "id"      TEXT NOT NULL,
  "text"    TEXT NOT NULL,
  "order"   INTEGER NOT NULL DEFAULT 0,
  "pollId"  TEXT NOT NULL,
  CONSTRAINT "poll_options_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "poll_options_pollId_idx" ON "poll_options"("pollId");
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Poll votes
CREATE TABLE "poll_votes" (
  "id"        TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "optionId"  TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  CONSTRAINT "poll_votes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "poll_votes_optionId_userId_key" ON "poll_votes"("optionId","userId");
CREATE INDEX "poll_votes_userId_idx" ON "poll_votes"("userId");
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "poll_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_userId_fkey"   FOREIGN KEY ("userId")   REFERENCES "users"("id")        ON DELETE CASCADE ON UPDATE CASCADE;

-- Post templates
CREATE TABLE "post_templates" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "isGlobal"  BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "creatorId" TEXT NOT NULL,
  CONSTRAINT "post_templates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "post_templates_creatorId_idx" ON "post_templates"("creatorId");
ALTER TABLE "post_templates" ADD CONSTRAINT "post_templates_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
