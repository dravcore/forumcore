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

> Branches are named after the feature, not the phase (e.g. `feat/rich-text-editor`).
> All feature branches target `develop`. Only `develop` merges into `main`.

---

### Phase 9 — Rich Text Editor

**Goal:** Replace plain textarea with a proper Markdown/WYSIWYG editor.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-35 | Integrate TipTap editor (Markdown mode) | `feat/rich-text-editor` |
| DRA-36 | Syntax highlighting for code blocks (Shiki/Prism) | `feat/code-highlighting` |
| DRA-37 | Image upload in posts (MinIO, UUID rename, 5MB limit) | `feat/post-image-upload` |
| DRA-38 | Live preview toggle (edit / preview split view) | `feat/editor-preview` |

---

### Phase 10 — Tag System

**Goal:** Allow threads to be tagged for better discoverability.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-39 | Tag model + schema migration | `feat/tag-schema` |
| DRA-40 | Tag selection on thread creation/edit (max 5 tags) | `feat/thread-tags` |
| DRA-41 | Tag pages: list threads by tag | `feat/tag-pages` |
| DRA-42 | Tag management in admin panel (create, merge, delete) | `feat/admin-tag-management` |

---

### Phase 11 — User Reputation & Badges

**Goal:** Build a trust and gamification layer on top of user activity.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-43 | Reputation score: calculated from reactions received + posts | `feat/reputation-score` |
| DRA-44 | Badge system: schema, award logic, display on profile | `feat/badges` |
| DRA-45 | Trust levels: MEMBER → REGULAR → VETERAN (auto-assigned) | `feat/trust-levels` |
| DRA-46 | Reputation/badge display on user profile and post items | `feat/reputation-ui` |

---

### Phase 12 — Private Messaging

**Goal:** Allow users to send direct messages to each other.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-47 | Conversation + Message schema migration | `feat/dm-schema` |
| DRA-48 | DM inbox: list conversations, unread count | `feat/dm-inbox` |
| DRA-49 | DM compose and reply UI | `feat/dm-compose` |
| DRA-50 | DM notifications (bell + email) | `feat/dm-notifications` |

---

### Phase 13 — Advanced Moderation

**Goal:** Give moderators and admins stronger tools to manage the community.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-51 | Moderation queue: review reports in a single view | `feat/moderation-queue` |
| DRA-52 | Temporary/permanent bans with expiry timestamps | `feat/user-bans` |
| DRA-53 | Audit log: record every admin/mod action to DB | `feat/audit-log` |
| DRA-54 | Audit log viewer in admin panel | `feat/audit-log-ui` |

---

### Phase 14 — Analytics & Insights

**Goal:** Provide actionable metrics about forum activity.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-55 | Forum-wide stats: DAU, new threads/posts per day | `feat/analytics-schema` |
| DRA-56 | Per-category analytics: activity, top contributors | `feat/category-analytics` |
| DRA-57 | Admin analytics dashboard with charts (Recharts) | `feat/analytics-dashboard` |
| DRA-58 | Content growth report: monthly snapshot export (CSV) | `feat/analytics-export` |

---

### Phase 15 — Public API & RSS

**Goal:** Expose forum data to external tools and feed readers.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-59 | Read-only REST API: categories, threads, posts | `feat/public-api` |
| DRA-60 | API key management (generate, revoke in settings) | `feat/api-keys` |
| DRA-61 | RSS feeds per category and site-wide | `feat/rss-feeds` |
| DRA-62 | Webhook support: fire events on new thread/post | `feat/webhooks` |

---

### Phase 16 — Performance & Scale

**Goal:** Harden the platform for higher traffic and larger datasets.

| Linear | Feature | Branch |
|--------|---------|--------|
| DRA-63 | Full Redis caching layer (categories, site settings, hot threads) | `feat/redis-cache` |
| DRA-64 | Background job queue for emails and heavy tasks | `feat/job-queue` |
| DRA-65 | Database index audit + slow query review | `feat/db-indexes` |
| DRA-66 | Bundle analysis and dynamic import optimization | `feat/bundle-optimization` |

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
