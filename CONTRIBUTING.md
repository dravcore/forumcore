# Katkıda Bulunma Rehberi

## Geliştirme Ortamı Kurulumu

```bash
git clone <repo-url>
cd forumcore
npm install
cp .env.example .env
# .env dosyasını düzenle
npx prisma migrate dev
npm run dev
```

## Git Workflow

### Temel Kural

`main` branch'e **asla** direkt commit yapılmaz. Her değişiklik bir branch'te geliştirilir, PR ile main'e alınır.

### Branch İsimlendirme

```
<tip>/<linear-id>-<kısa-açıklama>
```

| Prefix | Kullanım | Örnek |
|--------|----------|-------|
| `feat/` | Yeni özellik | `feat/dra-14-kategori-crud` |
| `fix/` | Bug düzeltme | `fix/dra-22-mention-hatasi` |
| `chore/` | Tooling, bağımlılık | `chore/dra-8-coolify-setup` |
| `refactor/` | Kod iyileştirme | `refactor/dra-16-pagination` |

### Commit Mesajı Formatı

[Conventional Commits](https://www.conventionalcommits.org/) formatı:

```
<tip>(<kapsam>): <açıklama>

feat(threads): add pagination to thread list
fix(auth): redirect to login when session expires
chore(deps): update prisma to 6.x
```

**Kapsam örnekleri:** `auth`, `threads`, `posts`, `categories`, `users`, `admin`, `db`, `ui`

### PR Süreci

1. Branch oluştur: `git checkout -b feat/dra-14-kategori-crud`
2. Değişiklikleri yap ve commit'le
3. `npm run build` — build alınmalı
4. `npm run typecheck` — TypeScript hatası olmamalı
5. PR aç, başlıkta Linear ID belirt: `feat(categories): add admin CRUD — Closes DRA-14`
6. Main'e merge et

## Çoklu Agent (Claude Code + Cursor)

İki AI agent aynı anda çalışırken:

- **Her agent farklı branch'te çalışır** — aynı branch'te eş zamanlı çalışma yapılmaz
- Yeni göreve başlamadan önce `git status` kontrol edilir
- Commit'ten önce `git pull origin main --rebase` ile güncel kalınır

## Kod Standartları

### İsimlendirme

| Tür | Format | Örnek |
|-----|--------|-------|
| Bileşen dosyası | PascalCase | `ThreadCard.tsx` |
| Action/query | camelCase | `threadActions.ts` |
| Hook | camelCase + `use` | `useInfiniteScroll.ts` |
| Sabit | UPPER_SNAKE_CASE | `MAX_POST_LENGTH` |

### Server Actions

```ts
// src/server/actions/threadActions.ts
export async function createThread(...) {}
export async function updateThread(...) {}
export async function deleteThread(...) {}
```

### Import Sırası

```ts
// 1. React/Next.js
// 2. Dış paketler
// 3. İç modüller (@/ alias)
// 4. Tip importları
```

## Test

```bash
npm run test          # Vitest unit/entegrasyon testleri
npm run test:e2e      # Playwright E2E testleri
npm run test:coverage # Coverage raporu
```

### Ne Test Edilmeli

- ✅ Server Actions (yetki kontrolü, input validasyonu, başarılı durum)
- ✅ Utility fonksiyonlar (slugify, formatDate vb.)
- ✅ Zod validasyon şemaları
- ✅ Kritik E2E akışlar (kayıt, giriş, thread oluşturma)
- ❌ shadcn/ui bileşenleri
- ❌ Snapshot testleri

## Environment Variables

Tüm env var'lar `src/env.ts` üzerinden Zod ile doğrulanır. Yeni bir değişken eklerken:

1. `src/env.ts`'e şema kuralını ekle
2. `.env.example`'a açıklamalı şekilde ekle
3. Coolify'da production değerini tanımla
4. `.env` yerel değerini ayarla (repoya commit etme)

## Veritabanı Değişiklikleri

```bash
# Schema değişikliği sonrası
npx prisma migrate dev --name <açıklayıcı-isim>
npx prisma generate
```

Migration isimleri açıklayıcı olmalı: `add_reaction_table`, `add_thread_pin_field`
