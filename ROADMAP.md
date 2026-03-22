# ForumCore — Roadmap

> All tasks are tracked on the [Linear ForumCore project](https://linear.app/dravcore/project/forumcore).
> Issue IDs are listed in parentheses for each phase.

---

## Completed Phases ✅

### Phase 1–5 — Core Infrastructure
Project scaffold, authentication (Better Auth), category/thread/post system, reactions, notifications, user profiles, moderation tools.

### Phase 6–9 — Moderation & UX
Admin panel, report queue, settings page, SEO, SSE real-time notifications, rate limiting.

### Phase 10 — Tag System (DRA-49–53)
Multi-tag support, tag-based thread filtering, admin tag management.

### Phase 11 — Reputation & Badges (DRA-54–58)
Reaction/post/thread-based reputation score, TrustLevel (MEMBER→REGULAR→VETERAN), 7 badges.

### Phase 12 — Direct Messaging (DRA-59–63)
Conversation + Message model, inbox, real-time DMs, rate limiting.

### Phase 13 — Advanced Moderation (DRA-64–68)
AuditLog, timed bans (bannedUntil), moderation queue, audit dashboard.

### Phase 14 — Analytics & Insights (DRA-65–68)
DailyStats model, Recharts dashboard, category/author analytics, CSV export.

### Phase 15 — Public API & RSS (DRA-69–72)
REST API v1, API Key + SHA-256 hash auth, RSS 2.0 feeds, HMAC-SHA256 webhooks.

### Phase 16 — Performance & Scalability (DRA-73–76)
Redis cache layer (ioredis), DB index audit (10 new composite indexes), `@next/bundle-analyzer`.

### Phase 17 — Rich Text Editor (DRA-77–86)
TipTap editor (bold, italic, headings, lists, code), Shiki syntax highlighting, MinIO image upload, SSRF-safe OGP link preview with Redis cache.

### Phase 18 — Advanced Search & Discovery (DRA-78, DRA-87–90)
PostgreSQL FTS (tsvector + GIN index + Turkish language trigger), hot score algorithm (Reddit-inspired), date range + sort filters, `/explore` trending page.

### Phase 19 — Bookmarks, Follow & Personal Feed (DRA-79, DRA-91–94)
Bookmark model, user follow system, category subscriptions, `/bookmarks` page, `/feed` personalized feed.

### Phase 20 — Polls & Content Enhancements (DRA-80, DRA-95–98)
Poll/PollOption/PollVote models, Q&A accepted answer mode, post edit history, post templates.

### Phase 21 — Email Notifications & Security (DRA-81, DRA-99–102)
Resend email digest (daily/weekly), notification preferences, session management page (view + revoke active sessions), 2FA fields.

### Phase 22 — Advanced Gamification (DRA-82, DRA-103–106)
Downvote (DISLIKE reaction), `/leaderboard` page (top by reputation/posts/threads), activity calendar (GitHub-style heatmap on user profiles).

---

## Research Sources

The backlog phases were shaped by analysing the following platforms:

| Platform | Notable Feature |
|----------|-----------------|
| **Discourse** | Trust levels, TipTap editor, email digest, poll system |
| **Reddit** | Velocity-based trending, bookmark, subreddit follow, post templates |
| **Stack Overflow** | Accepted answer, downvote, bronze/silver/gold badges, reputation unlocks |
| **Hacker News** | Hot score algorithm, minimal UX, comment quality culture |
| **Lemmy** | Self-hosted, open source, federated community management |
| **Discord Forum Channels** | Tag-based organisation, post threads |
| **XenForo** | Advanced moderation, responsive design |
| **GitHub** | Contribution calendar, session management, 2FA |
