# ForumCore

Self-hosted forum platformu. Next.js 16 App Router + TypeScript + PostgreSQL + Better Auth, Coolify üzerinde çalışır.

## Stack

- **Framework:** Next.js 16 App Router (`src/` dizini, `@/*` alias)
- **Dil:** TypeScript (strict mode)
- **Stil:** Tailwind CSS v4 + shadcn/ui
- **DB:** PostgreSQL + Prisma ORM
- **Auth:** Better Auth
- **Storage:** MinIO (Coolify)
- **Cache:** Redis (Coolify)
- **Deploy:** Coolify (kendi sunucu) — `output: "standalone"` zorunlu

## Proje Yapısı

```
src/
├── app/          # Next.js App Router sayfaları ve API route'ları
├── components/   # UI bileşenleri
│   └── ui/       # shadcn/ui bileşenleri (elle düzenleme yapma, npx shadcn add)
├── lib/          # auth.ts, db.ts, utils.ts gibi singleton'lar
├── server/       # Server-only iş mantığı (queries, actions)
└── types/        # Paylaşılan TypeScript tipleri
prisma/
└── schema.prisma
```

## Kodlama Kuralları

- Server Components varsayılan; `"use client"` yalnızca gerektiğinde ekle
- Veri çekme Server Components veya Server Actions ile yapılır
- API route'ları yalnızca SSE, webhook ve harici servisler için kullan
- Form validasyonu Zod ile yap
- `src/lib/db.ts` Prisma Client singleton — başka yerde `new PrismaClient()` açma
- Environment variable'lar Coolify UI'dan yönetilir; `.env` repoya commit edilmez
- Vercel-specific özellikler kullanma (Edge Runtime, ISR vb.)
- `output: "standalone"` next.config.ts'de kalmalı — Coolify için zorunlu

## Veritabanı

- Prisma ORM kullan
- Migration geliştirmede: `npx prisma migrate dev`
- Migration deploy'da: `npx prisma migrate deploy`
- Schema: `prisma/schema.prisma`

## Güvenlik

- Her Server Action başında Zod ile input doğrula, session + rol kontrolü yap
- `dangerouslySetInnerHTML` kullanma; kullanıcı içeriğini her zaman sanitize et
- Hata mesajlarında DB/stack trace detaylarını kullanıcıya gösterme
- Dosya upload'da MIME + boyut kontrolü yap, dosyayı UUID ile yeniden adlandır
- `$queryRaw` içine string interpolasyonu koyma (`Prisma.sql` kullan)
- Secret'ları kod içine yazma; `process.env` erişimini `src/env.ts` üzerinden yap

## Performans

- N+1 sorgusundan kaç: liste sorgularında `include`/`select` ile ilişkileri tek sorguda çek
- Listede büyük metin alanlarını (`content`) çekme, detay sayfasında çek
- Tüm listeyi tek seferde çekme — her zaman pagination kullan (varsayılan: 20 kayıt)
- Paralel çalışabilecek sorguları `Promise.all` ile birleştir
- Sık okunan statik veriyi `unstable_cache` veya Redis ile cachele
- `<img>` yerine Next.js `<Image>` kullan

## Hata Yönetimi

- Server Actions exception fırlatmak yerine `{ success, error }` yapısı döndürmeli
- `notFound()` ve `redirect()` try/catch içine alma — Next.js bunları özel exception olarak fırlatır
- Her route için `error.tsx` ve `not-found.tsx` tanımla
- `console.log` production'da bırakma; loglama `src/lib/logger.ts` üzerinden

## UI/UX Tasarım Standartları

UI kodu yazarken deneyimli bir UI/UX tasarımcısı gibi davran. Fonksiyonellik kadar görsel kalite, hiyerarşi ve kullanıcı deneyimi birinci önceliktir.

- **Görsel hiyerarşi:** Boyut, renk ve boşluk ile kullanıcı gözünü yönlendir
- **Boşluk:** Sıkışık UI yazma; nefes alan, yeterli padding/margin kullanan tasarım yap
- **Tutarlılık:** shadcn/ui token'larını kullan (`muted-foreground`, `destructive`, `accent` vb.), ham hex veya `gray-*` sabit renk kullanma
- **Geri bildirim:** Her aksiyonun görsel karşılığı olmalı — hover, focus, loading, error, success
- **Boş durumlar:** Boş liste bırakma; açıklayıcı mesaj ve aksiyon butonu göster
- **Erişilebilirlik:** `focus-visible:ring`, ikon butonlara `aria-label`, `<div onClick>` yerine `<button>`
- **Mobil öncelikli:** Her bileşen mobil uyumlu; sabit genişlik (`w-[400px]`) kullanma
- **Form:** Label üstte, hata `text-destructive text-sm` altında, submit loading state'inde disabled

## İsimlendirme Kuralları

- Dosyalar: bileşenler `PascalCase.tsx`, diğerleri `camelCase.ts`
- Değişken/fonksiyon: `camelCase` — boolean `is/has/can` prefix'i ile
- Server actions: `createX`, `updateX`, `deleteX`, `pinX` formatı (`src/server/actions/`)
- Queries: `getXByY`, `getXs` formatı (`src/server/queries/`)
- Event handler'lar: `handleSubmit`, `handleDelete` (`handle` prefix)
- Sabitler: `UPPER_SNAKE_CASE`

## Git Workflow

- `main`'e direkt commit yasak — her özellik kendi branch'inde
- Branch format: `feat/dra-14-kategori-crud`, `fix/dra-22-mention-hatasi`
- Commit format: `feat(threads): add pagination` (Conventional Commits)
- Çoklu agent (Claude + Cursor) aynı anda **farklı branch**'lerde çalışır
- PR açılmadan önce: build alınmalı, TypeScript hatası olmamalı

## Test Stratejisi

- **Vitest** ile server action'ları ve utility fonksiyonlarını test et
- **Playwright** ile kritik E2E akışları test et (kayıt, giriş, thread oluşturma)
- Test dosyaları test edilecek dosyanın yanında `__tests__/` klasöründe
- Her server action için en az: yetkisiz erişim testi + geçersiz input testi
- Snapshot testi yazma, bileşen render testinden kaçın

## Environment Variables

- Tüm env var'lar `src/env.ts` üzerinden Zod ile doğrulanır (`@t3-oss/env-nextjs`)
- `process.env.X` direkt kullanma, her zaman `import { env } from "@/env"` üzerinden eriş
- `.env.example` dosyasını her zaman güncel tut
- Secret'lar asla `NEXT_PUBLIC_` prefix'i almamalı

## Linear

Proje: ForumCore (Dravcore workspace)
Issue'lar DRA-5'ten başlar — her görev bir Linear issue.
