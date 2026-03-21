# ForumCore Roadmap

## Completed (Phases 1–8)

| Phase | Features |
|-------|---------|
| 1–2 | Core forum: categories, threads, posts, auth (Better Auth), user profiles |
| 3–4 | Thread/post management: pin, lock, edit, soft delete, pagination |
| 5 | Interactions: reactions, quote/mention, reports, user management |
| 6 | Search (PostgreSQL FTS), notifications, SSE, email (Resend) |
| 7 | Admin dashboard, site settings, user management with search |
| 8 | SEO (sitemap, robots, OG), rate limiting, structured logging, health endpoint |

---

## Upcoming Phases

In Linear, each phase below maps to a **milestone** and an **epic issue** (**DRA-37** … **DRA-44**). Sub-tasks are child issues under that epic. The **Linear** column shows the child issue key.

> Branches are named after the feature, not the phase (e.g. `feat/rich-text-editor`).
> All feature branches target `develop`. Only `develop` merges into `main`.

---

### Phase 9 — Rich Text Editor

**Goal:** Replace plain textarea with a proper Markdown/WYSIWYG editor.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-45 | Integrate TipTap editor (Markdown mode) | `feat/rich-text-editor` |
| DRA-46 | Syntax highlighting for code blocks (Shiki/Prism) | `feat/code-highlighting` |
| DRA-47 | Image upload in posts (MinIO, UUID rename, 5MB limit) | `feat/post-image-upload` |
| DRA-48 | Live preview toggle (edit / preview split view) | `feat/editor-preview` |

Epic: **DRA-37** (Phase 9 — Rich Text Editor).

---

### Phase 10 — Tag System

**Goal:** Allow threads to be tagged for better discoverability.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-49 | Tag model + schema migration | `feat/tag-schema` |
| DRA-50 | Tag selection on thread creation/edit (max 5 tags) | `feat/thread-tags` |
| DRA-51 | Tag pages: list threads by tag | `feat/tag-pages` |
| DRA-52 | Tag management in admin panel (create, merge, delete) | `feat/admin-tag-management` |

Epic: **DRA-38** (Phase 10 — Tag System).

---

### Phase 11 — User Reputation & Badges

**Goal:** Build a trust and gamification layer on top of user activity.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-53 | Reputation score: calculated from reactions received + posts | `feat/reputation-score` |
| DRA-54 | Badge system: schema, award logic, display on profile | `feat/badges` |
| DRA-55 | Trust levels: MEMBER → REGULAR → VETERAN (auto-assigned) | `feat/trust-levels` |
| DRA-56 | Reputation/badge display on user profile and post items | `feat/reputation-ui` |

Epic: **DRA-39** (Phase 11 — User Reputation & Badges).

---

### Phase 12 — Private Messaging

**Goal:** Allow users to send direct messages to each other.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-57 | Conversation + Message schema migration | `feat/dm-schema` |
| DRA-58 | DM inbox: list conversations, unread count | `feat/dm-inbox` |
| DRA-59 | DM compose and reply UI | `feat/dm-compose` |
| DRA-60 | DM notifications (bell + email) | `feat/dm-notifications` |

Epic: **DRA-40** (Phase 12 — Private Messaging).

---

### Phase 13 — Advanced Moderation

**Goal:** Give moderators and admins stronger tools to manage the community.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-61 | Moderation queue: review reports in a single view | `feat/moderation-queue` |
| DRA-62 | Temporary/permanent bans with expiry timestamps | `feat/user-bans` |
| DRA-63 | Audit log: record every admin/mod action to DB | `feat/audit-log` |
| DRA-64 | Audit log viewer in admin panel | `feat/audit-log-ui` |

Epic: **DRA-41** (Phase 13 — Advanced Moderation).

---

### Phase 14 — Analytics & Insights

**Goal:** Provide actionable metrics about forum activity.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-65 | Forum-wide stats: DAU, new threads/posts per day | `feat/analytics-schema` |
| DRA-66 | Per-category analytics: activity, top contributors | `feat/category-analytics` |
| DRA-67 | Admin analytics dashboard with charts (Recharts) | `feat/analytics-dashboard` |
| DRA-68 | Content growth report: monthly snapshot export (CSV) | `feat/analytics-export` |

Epic: **DRA-42** (Phase 14 — Analytics & Insights).

---

### Phase 15 — Public API & RSS

**Goal:** Expose forum data to external tools and feed readers.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-69 | Read-only REST API: categories, threads, posts | `feat/public-api` |
| DRA-70 | API key management (generate, revoke in settings) | `feat/api-keys` |
| DRA-71 | RSS feeds per category and site-wide | `feat/rss-feeds` |
| DRA-72 | Webhook support: fire events on new thread/post | `feat/webhooks` |

Epic: **DRA-43** (Phase 15 — Public API & RSS).

---

### Phase 16 — Performance & Scale

**Goal:** Harden the platform for higher traffic and larger datasets.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-73 | Full Redis caching layer (categories, site settings, hot threads) | `feat/redis-cache` |
| DRA-74 | Background job queue for emails and heavy tasks | `feat/job-queue` |
| DRA-75 | Database index audit + slow query review | `feat/db-indexes` |
| DRA-76 | Bundle analysis and dynamic import optimization | `feat/bundle-optimization` |

Epic: **DRA-44** (Phase 16 — Performance & Scale).

---

## Branch Flow Reference

```
main          ←── develop  ←── feat/rich-text-editor
                           ←── feat/tag-system
                           ←── fix/notification-duplicate
                           ←── ...
```

1. Branch off from `develop` for every feature
2. Open PR → `develop` when the feature is complete
3. Batch stable features and open PR `develop` → `main`
4. Merging to `main` triggers Coolify production deploy
