# Güvenlik Politikası

## Güvenlik Açığı Bildirme

Projede bir güvenlik açığı keşfettiysen lütfen GitHub Issues üzerinden **public** olarak açma.
Bunun yerine doğrudan proje sahibine özel mesaj ile bildir.

Bildiriminde şunları belirt:
- Açığın türü (XSS, SQL injection, auth bypass vb.)
- Açığı tetiklemek için adımlar
- Olası etkisi
- Varsa düzeltme önerisi

## Desteklenen Versiyonlar

Yalnızca `main` branch'teki son versiyon güvenlik güncellemeleri alır.

## Güvenlik Önlemleri

### Kullanıcı İçeriği

- Tüm kullanıcı girdileri Zod ile doğrulanır
- Markdown içerik `rehype-sanitize` ile render edilir
- `dangerouslySetInnerHTML` kullanılmaz

### Kimlik Doğrulama

- Better Auth ile yönetilir
- Şifreler bcrypt ile hashlenir
- Session'lar güvenli HTTP-only cookie'lerde saklanır
- OAuth 2.0 desteği (Google, GitHub)

### Yetkilendirme

- Her server action'da session + rol kontrolü yapılır
- Kaynak sahipliği doğrulanır (kullanıcı yalnızca kendi içeriğini düzenleyebilir)
- Admin işlemleri ayrı middleware ile korunur

### Veritabanı

- Prisma ORM parametreli sorgular kullanır (SQL injection koruması)
- `$queryRaw` kullanıldığında `Prisma.sql` tagged template ile

### Dosya Upload

- MIME type kontrolü (server tarafında)
- Maksimum boyut sınırı
- UUID ile yeniden adlandırma
- MinIO signed URL ile servis

### HTTP Güvenlik Başlıkları

`next.config.ts` içinde tanımlıdır:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Rate Limiting

- Redis tabanlı rate limiter
- Auth endpoint'leri: 5 istek / dakika
- Post oluşturma: 10 istek / dakika

## Bağımlılık Güncellemeleri

```bash
npm audit          # Güvenlik açığı taraması
npm audit fix      # Otomatik düzeltilebilenleri güncelle
```

Bağımlılıklar düzenli aralıklarla güncellenir. Kritik güvenlik açıkları ivedilikle giderilir.
