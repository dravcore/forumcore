# ForumCore — Roadmap

> Tüm görevler [Linear ForumCore projesi](https://linear.app/dravcore/project/forumcore) üzerinde takip edilir.
> Her fazın issue ID'leri parantez içinde belirtilmiştir.

---

## Tamamlanan Fazlar ✅

### Faz 1–5 — Temel Altyapı
Proje iskeleti, kimlik doğrulama (Better Auth), kategori/konu/gönderi sistemi, tepkiler, bildirimler, kullanıcı profilleri, moderasyon araçları.

### Faz 6–9 — Moderasyon ve UX
Admin paneli, rapor kuyruğu, ayarlar sayfası, SEO, SSE gerçek zamanlı bildirimler, hız sınırlama.

### Faz 10 — Etiket Sistemi (DRA-49–53)
Çoklu etiket desteği, etiket bazlı konu filtreleme, admin etiket yönetimi.

### Faz 11 — İtibar ve Rozetler (DRA-54–58)
Tepki/gönderi/konu bazlı itibar puanı, TrustLevel (MEMBER→REGULAR→VETERAN), 7 rozet.

### Faz 12 — Özel Mesajlaşma (DRA-59–63)
Conversation + Message modeli, gelen kutusu, gerçek zamanlı DM, hız sınırlama.

### Faz 13 — Gelişmiş Moderasyon (DRA-64–68)
AuditLog, süreli yasaklama (bannedUntil), moderasyon kuyruğu, denetim tablosu.

### Faz 14 — Analitik ve İçgörüler (DRA-65–68)
DailyStats modeli, Recharts dashboard, kategori/yazar analitiği, CSV export.

### Faz 15 — Genel API ve RSS (DRA-69–72)
REST API v1, API Key + SHA-256 hash auth, RSS 2.0 akışları, HMAC-SHA256 webhook.

### Faz 16 — Performans ve Ölçek (DRA-73–76)
Redis önbellek katmanı (ioredis), DB index denetimi (10 yeni composite index), `@next/bundle-analyzer`.

---

## Backlog

### Faz 17 — Zengin Metin Editörü (DRA-77–86) 🔴 Yüksek Öncelik

Kullanıcılara Discourse/Reddit kalitesinde formatlama deneyimi.

| Issue | Başlık | Öncelik |
|-------|--------|---------|
| DRA-83 | TipTap editör entegrasyonu (bold, italic, başlık, liste, alıntı) | Yüksek |
| DRA-84 | Kod blokları ve syntax highlighting (Shiki) | Yüksek |
| DRA-85 | Gönderi içi resim yükleme (MinIO inline upload) | Orta |
| DRA-86 | OGP link önizlemesi (Onebox benzeri kart) | Orta |

**İlham:** Discourse (TipTap/ProseMirror), Reddit (code blocks), Stack Overflow (syntax highlighting)

---

### Faz 18 — Gelişmiş Arama ve Keşif (DRA-78, DRA-87–90) 🔴 Yüksek Öncelik

İçerik keşfini kolaylaştıran arama ve trending sistemi.

| Issue | Başlık | Öncelik |
|-------|--------|---------|
| DRA-87 | PostgreSQL full-text search (tsvector + GIN index) | Yüksek |
| DRA-88 | Hot/trending algoritması (HN + Reddit tarzı hız skoru) | Yüksek |
| DRA-89 | Gelişmiş arama filtreleri (kategori, etiket, yazar, tarih) | Orta |
| DRA-90 | Keşif sayfası: Trending, Yeni ve Popüler sekmeleri | Orta |

**İlham:** Hacker News (hot score), Reddit (velocity-based trending), Discourse (full-text search)

---

### Faz 19 — Yer İmleri, Takip ve Kişisel Akış (DRA-79, DRA-91–94) 🟡 Orta Öncelik

Kullanıcıyı platforma bağlayan kişiselleştirilmiş deneyim.

| Issue | Başlık | Öncelik |
|-------|--------|---------|
| DRA-91 | Konu ve gönderi yer işareti (bookmark) | Orta |
| DRA-92 | Kullanıcı takip sistemi (follow/unfollow) | Orta |
| DRA-93 | Kategori ve etiket aboneliği (subscription) | Orta |
| DRA-94 | Kişisel akış sayfası (/feed) | Orta |

**İlham:** Reddit (save + subreddit follow), Discourse (watched topics), Twitter/X (following feed)

---

### Faz 20 — Anket ve İçerik Geliştirmeleri (DRA-80, DRA-95–98) 🟡 Orta Öncelik

Etkileşimli içerik türleri ve kalite araçları.

| Issue | Başlık | Öncelik |
|-------|--------|---------|
| DRA-95 | Anket sistemi (tek/çoklu seçim, son tarih) | Orta |
| DRA-96 | Q&A modu: kabul edilmiş cevap işaretleme | Orta |
| DRA-97 | Gönderi düzenleme geçmişi (diff görünümü) | Düşük |
| DRA-98 | Gönderi şablonları (kategori bazlı) | Düşük |

**İlham:** Discourse (polls), Stack Overflow (accepted answer), Reddit (post templates)

---

### Faz 21 — E-posta Bildirimleri ve Güvenlik (DRA-81, DRA-99–102) 🟡 Orta Öncelik

Platform dışı bildirimler ve hesap güvenliği güçlendirmesi.

| Issue | Başlık | Öncelik |
|-------|--------|---------|
| DRA-99  | E-posta bildirimleri: yanıt ve mention (Resend) | Yüksek |
| DRA-100 | Haftalık özet (digest) e-postası | Orta |
| DRA-101 | İki faktörlü kimlik doğrulama (2FA / TOTP) | Yüksek |
| DRA-102 | Oturum yönetimi: aktif cihazlar ve toplu çıkış | Orta |

**İlham:** Discourse (email digest), GitHub (2FA), Stack Overflow (session management)

---

### Faz 22 — Gelişmiş Gamification ve Topluluk Sağlığı (DRA-82, DRA-103–106) 🔵 Düşük Öncelik

Kaliteli katkıyı ödüllendirme ve topluluk rekabetini canlandırma.

| Issue | Başlık | Öncelik |
|-------|--------|---------|
| DRA-103 | Downvote sistemi (Regular+ trust level gerektirir) | Orta |
| DRA-104 | Liderlik tablosu (haftalık / aylık / tüm zamanlar) | Düşük |
| DRA-105 | Bronz / gümüş / altın rozet kademeleri | Düşük |
| DRA-106 | Kullanıcı aktivite takvimi (katkı grafiği) | Düşük |

**İlham:** Stack Overflow (downvote + badge tiers), GitHub (contribution calendar), Reddit (karma leaderboard)

---

## Araştırma Kaynakları

Backlog fazları şu platformların incelenmesiyle şekillendirildi:

| Platform | Öne Çıkan Özellik |
|----------|-------------------|
| **Discourse** | Trust levels, TipTap editör, e-posta digest, anket sistemi |
| **Reddit** | Velocity-based trending, bookmark, subreddit follow, post templates |
| **Stack Overflow** | Accepted answer, downvote, bronze/silver/gold badges, reputation unlocks |
| **Hacker News** | Hot score algoritması, sade UX, yorum kalite kültürü |
| **Lemmy** | Self-hosted, açık kaynak, federe topluluk yönetimi |
| **Discord Forum Channels** | Tag-based organization, post threads |
| **XenForo** | Advanced moderation, responsive design |
| **GitHub** | Contribution calendar, session management, 2FA |
