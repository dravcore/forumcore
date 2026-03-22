import { codeToHtml } from 'shiki'

/**
 * Processes HTML post content server-side:
 * - Replaces <pre><code class="language-X"> blocks with Shiki-highlighted HTML
 *
 * Runs on the server only; the result is passed to client components as a string.
 */
export async function processContent(html: string): Promise<string> {
  const codeBlockRegex = /<pre><code(?:\s+class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g
  const matches = [...html.matchAll(codeBlockRegex)]
  if (matches.length === 0) return html

  let result = html

  for (const match of matches) {
    const [full, lang, rawCode] = match
    const code = rawCode
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

    const language = lang?.trim() || 'text'

    try {
      const highlighted = await codeToHtml(code, {
        lang: language,
        theme: 'github-dark',
      })
      // Wrap with copy button
      const langLabel = language !== 'text' ? `<span class="lang-label">${language}</span>` : ''
      const wrapped = `<div class="shiki-wrapper" data-language="${language}">
        ${langLabel}
        <button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('[data-language]').querySelector('code')?.innerText??'')">Kopyala</button>
        ${highlighted}
      </div>`
      result = result.replace(full, wrapped)
    } catch {
      // Unsupported language — leave plain
    }
  }

  return result
}
