# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please **do not** open a public GitHub Issue.
Instead, notify the project owner directly via private message.

Your report should include:
- Type of vulnerability (XSS, SQL injection, auth bypass, etc.)
- Steps to reproduce the issue
- Potential impact
- Suggested fix, if any

## Supported Versions

Only the latest version on the `main` branch receives security updates.

## Security Measures

### User Content

- All user input is validated with Zod
- Markdown content is rendered with `rehype-sanitize`
- `dangerouslySetInnerHTML` is never used

### Authentication

- Managed by Better Auth
- Passwords are hashed with bcrypt
- Sessions are stored in secure HTTP-only cookies
- OAuth 2.0 support (Google, GitHub)

### Authorization

- Every server action checks session + role
- Resource ownership is verified (users can only edit their own content)
- Admin operations are protected by separate middleware

### Database

- Prisma ORM uses parameterized queries (SQL injection protection)
- When using `$queryRaw`, always use `Prisma.sql` tagged templates

### File Uploads

- MIME type validation (server-side)
- Maximum file size limit
- Files renamed with UUID
- Served via MinIO signed URLs

### HTTP Security Headers

Defined in `next.config.ts`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Rate Limiting

- In-memory rate limiter
- Auth endpoints: 5 requests / minute
- Post creation: 10 requests / minute

## Dependency Updates

```bash
npm audit          # Scan for vulnerabilities
npm audit fix      # Auto-fix where possible
```

Dependencies are updated regularly. Critical security vulnerabilities are addressed immediately.
