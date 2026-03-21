# Proje Yapısı

## Kök Dizin

```
forumcore/
├── .cursor/
│   └── rules/               # Cursor AI kuralları (.mdc)
├── prisma/
│   ├── schema.prisma        # Veritabanı şeması
│   └── migrations/          # Migration geçmişi
├── public/                  # Statik dosyalar
├── src/                     # Uygulama kodu
├── tests/
│   └── e2e/                 # Playwright E2E testleri
├── .env.example             # Gerekli env var şablonu
├── CLAUDE.md                # Claude Code bağlamı
├── CONTRIBUTING.md          # Geliştirme kuralları
├── SECURITY.md              # Güvenlik politikası
└── STRUCTURE.md             # Bu dosya
```

## src/ Dizini

```
src/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Route group — auth sayfaları
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (forum)/                 # Route group — forum sayfaları
│   │   ├── c/
│   │   │   └── [slug]/          # Kategori sayfası
│   │   │       └── page.tsx
│   │   └── t/
│   │       └── [slug]/          # Thread detay sayfası
│   │           └── page.tsx
│   ├── admin/                   # Admin paneli
│   │   ├── _components/         # Sadece admin'e ait bileşenler
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/        # Better Auth handler
│   │   └── sse/                 # Server-Sent Events
│   ├── error.tsx                # Global hata sayfası
│   ├── not-found.tsx            # 404 sayfası
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Ana sayfa
│
├── components/
│   ├── ui/                      # shadcn/ui bileşenleri (dokunma)
│   ├── forum/                   # Forum'a özel bileşenler
│   │   ├── ThreadCard.tsx
│   │   ├── PostItem.tsx
│   │   └── CategoryList.tsx
│   └── shared/                  # Genel paylaşılan bileşenler
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── UserAvatar.tsx
│
├── lib/
│   ├── db.ts                    # Prisma Client singleton
│   ├── auth.ts                  # Better Auth (server) config
│   ├── auth-client.ts           # Better Auth (client) config
│   ├── env.ts                   # Environment validasyonu (Zod)
│   ├── logger.ts                # Loglama utility
│   └── utils.ts                 # cn() ve genel utils
│
├── server/
│   ├── actions/                 # Server Actions (mutation)
│   │   ├── threadActions.ts
│   │   ├── postActions.ts
│   │   ├── userActions.ts
│   │   └── __tests__/           # Action testleri
│   ├── queries/                 # DB okuma fonksiyonları
│   │   ├── threadQueries.ts
│   │   ├── categoryQueries.ts
│   │   └── __tests__/
│   └── validations/             # Zod şemaları
│       ├── threadValidations.ts
│       └── postValidations.ts
│
└── types/                       # Paylaşılan TypeScript tipleri
    ├── thread.types.ts
    └── user.types.ts
```

## Prisma Schema Modelleri

| Model | Açıklama | Faz |
|-------|----------|-----|
| `User` | Kullanıcılar — Better Auth uyumlu + forum alanları (username, role, bio) | 1 |
| `Session` | Better Auth session'ları | 1 |
| `Account` | Better Auth OAuth hesapları | 1 |
| `Verification` | Email doğrulama token'ları | 1 |
| `Category` | Forum kategorileri (slug, order) | 1 |
| `Thread` | Konular (isPinned, isLocked, softDelete) | 1 |
| `Post` | Yanıtlar (content, editedAt, softDelete) | 1 |
| `Reaction` | Like/reaction'lar | 5 |
| `Notification` | Bildirimler | 6 |
| `Report` | Kullanıcı raporları | 5 |

## Cursor AI Kuralları

`.cursor/rules/` altındaki dosyalar Cursor agent'ının bağlamını oluşturur:

| Dosya | Kapsam | Her Zaman Aktif |
|-------|--------|:-:|
| `project.mdc` | Genel kurallar, stack | ✅ |
| `security.mdc` | Güvenlik zorunlulukları | ✅ |
| `conventions.mdc` | İsimlendirme, dosya yapısı | ✅ |
| `git.mdc` | Branch/commit stratejisi | ✅ |
| `database.mdc` | Prisma, sorgu kuralları | — |
| `components.mdc` | React bileşen kuralları | — |
| `design.mdc` | UI/UX standartları | — |
| `auth.mdc` | Better Auth kullanımı | — |
| `performance.mdc` | N+1, caching, bundle | — |
| `error-handling.mdc` | Hata yönetimi | — |
| `testing.mdc` | Test stratejisi | — |
| `env-config.mdc` | Environment validasyonu | — |
