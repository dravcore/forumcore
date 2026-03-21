# ForumCore

Self-hosted, modern forum platformu. Next.js 16 + TypeScript + PostgreSQL + Better Auth stack ile Coolify üzerinde çalışır.

## Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 App Router |
| Dil | TypeScript (strict) |
| Stil | Tailwind CSS v4 + shadcn/ui |
| Veritabanı | PostgreSQL + Prisma ORM |
| Auth | Better Auth |
| Storage | MinIO |
| Cache | Redis |
| Deploy | Coolify (self-hosted) |

## Gereksinimler

- Node.js 20+
- PostgreSQL 16+
- Redis 7+

## Kurulum

### 1. Repoyu klonla

```bash
git clone <repo-url>
cd forumcore
npm install
```

### 2. Environment variable'ları ayarla

```bash
cp .env.example .env
```

`.env` dosyasını düzenle ve gerekli değerleri gir.

### 3. Veritabanını hazırla

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Geliştirme sunucusunu başlat

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresinde çalışır.

## Kullanışlı Komutlar

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript kontrol

npx prisma studio    # DB görsel arayüzü
npx prisma migrate dev --name <isim>   # Yeni migration
```

## Deploy (Coolify)

1. Coolify'da yeni bir Next.js servisi oluştur (Nixpacks)
2. PostgreSQL ve Redis servislerini Coolify'dan başlat
3. Environment variable'ları Coolify UI'dan tanımla
4. GitHub reposunu bağla — push tetiklemede otomatik deploy

Deploy detayları için `CONTRIBUTING.md` dosyasına bak.

## Proje Yapısı

Detaylı yapı için [`STRUCTURE.md`](./STRUCTURE.md) dosyasına bak.

## Katkıda Bulunmak

Geliştirme süreci, branch stratejisi ve kurallar için [`CONTRIBUTING.md`](./CONTRIBUTING.md) dosyasına bak.

## Güvenlik

Güvenlik açığı bildirmek için [`SECURITY.md`](./SECURITY.md) dosyasına bak.
