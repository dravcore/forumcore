import { Resend } from 'resend'
import { env } from '@/env'
import { logger } from '@/lib/logger'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    logger.warn('RESEND_API_KEY not set — email not sent', { to, subject })
    return
  }

  try {
    await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html })
  } catch (err) {
    logger.error('Failed to send email', { to, subject, err })
  }
}

export function welcomeEmailHtml(name: string, appUrl: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h1 style="font-size:20px;font-weight:700;margin-bottom:8px">ForumCore'a hoş geldin, ${name}!</h1>
      <p style="color:#6b7280;margin-bottom:16px">Hesabın başarıyla oluşturuldu. Forumu keşfetmeye başlayabilirsin.</p>
      <a href="${appUrl}" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
        Foruma Git
      </a>
    </div>
  `
}

export function replyEmailHtml({
  actorName,
  threadTitle,
  threadUrl,
}: {
  actorName: string
  threadTitle: string
  threadUrl: string
}) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <p style="color:#6b7280;margin-bottom:8px"><strong>${actorName}</strong> konuna yanıt verdi:</p>
      <p style="font-weight:600;margin-bottom:16px">${threadTitle}</p>
      <a href="${threadUrl}" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
        Yanıtı Gör
      </a>
    </div>
  `
}

export function digestEmailHtml({
  userName,
  unreadCount,
  notifications,
  appUrl,
}: {
  userName: string
  unreadCount: number
  notifications: { text: string; url: string }[]
  appUrl: string
}) {
  const items = notifications
    .slice(0, 10)
    .map(
      (n) => `<li style="margin-bottom:8px">
        <a href="${n.url}" style="color:#111;text-decoration:none">${n.text}</a>
      </li>`
    )
    .join('')

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h1 style="font-size:18px;font-weight:700;margin-bottom:8px">Merhaba ${userName}</h1>
      <p style="color:#6b7280;margin-bottom:16px">
        ${unreadCount} okunmamış bildiriminiz var.
      </p>
      <ul style="padding-left:16px;margin-bottom:20px">${items}</ul>
      <a href="${appUrl}/notifications" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
        Tüm Bildirimleri Gör
      </a>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
      <p style="font-size:12px;color:#9ca3af">
        Bu e-postayı almak istemiyorsanız
        <a href="${appUrl}/settings/notifications" style="color:#9ca3af">
          bildirim ayarlarınızdan</a> kapatabilirsiniz.
      </p>
    </div>
  `
}

export function mentionEmailHtml({
  actorName,
  threadTitle,
  threadUrl,
}: {
  actorName: string
  threadTitle: string
  threadUrl: string
}) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <p style="color:#6b7280;margin-bottom:8px"><strong>${actorName}</strong> seni bir konuda bahsetti:</p>
      <p style="font-weight:600;margin-bottom:16px">${threadTitle}</p>
      <a href="${threadUrl}" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
        Konuya Git
      </a>
    </div>
  `
}
