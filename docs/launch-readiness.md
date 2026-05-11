# Launch Readiness — Privacy, Security, Compliance

Status as of release. India-first market, recruiter-only audience.

## ✅ Shipped in this pass

### Legal & policy
- **Privacy Policy** at `/privacy` — DPDP Act 2023 aligned, names every sub-processor (Anthropic, Vercel, Neon, Google, PostHog), cross-border transfer disclosure, grievance officer mailbox, candidate-data carve-out (we are processor, recruiter is fiduciary).
- **Terms of Service** at `/terms` — IP, AI disclaimer, recruiter responsibilities under DPDP, governing law India (Bengaluru), liability cap.
- **Data Processing Agreement** at `/dpa` — formalises the processor relationship for candidate data; sub-processor list; 30-day deletion on termination.
- All three linked from: landing footer, dashboard sidebar, login page consent line.

### Consent & cookies
- **Cookie banner** appears bottom-right on first visit. Two choices: *Essential only* / *Accept all*. Persists in `localStorage`.
- **PostHog defaults to opt-out** — `opt_out_capturing_by_default: true`. Only flips to opt-in when the user accepts the banner.
- "Manage cookies" link in dashboard sidebar lets users revoke consent.

### Security headers (next.config.mjs)
- `Content-Security-Policy` — locked-down `default-src 'self'`; allowlist for PostHog, Vercel Live, Google avatars.
- `Strict-Transport-Security` — 2 years + preload.
- `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` (clickjacking).
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` — camera, mic, geolocation, FLoC all denied.

### Multi-tenancy & auth
- All server actions checked: every Prisma query filters by `userId` from `auth()`.
- Middleware now uses an explicit public-path list (`/`, `/login`, `/privacy`, `/terms`, `/dpa`, `/share`, `/api/auth`).
- Static assets bypass auth middleware (faster + cheaper).

### Right to access / erasure (DPDP §11 + §12)
- **Data export** — `/api/account/export` returns a complete JSON of the user's account + jobs + candidates + applications + feedback + communications + usage.
- **Account deletion** — Settings → Your data & account → *Delete my account*. Requires typing the account email to confirm. Cascade deletes every row owned by the user.
- Both wired to PostHog as `account_deleted` event for funnel monitoring.

### File-upload safety
- 10 MB hard cap per file in `lib/parse-file.ts`.
- Extension + MIME whitelist (PDF / DOCX / TXT).
- Empty-file rejection.
- Files are parsed in memory; only extracted text is persisted (no binary storage).

### SEO & crawl control
- `/robots.txt` — allows landing & legal, disallows dashboard / API / share links.
- `/sitemap.xml` — landing + legal pages only.

---

## ⚠️ Operational tasks for you (not code)

These are things only you can do; the app code is ready.

### Before launch
1. **Set up the privacy/grievance mailboxes** — `privacy@smartats.in`, `grievance@smartats.in`, `legal@smartats.in`. Even simple forwarders to your inbox work. The DPDP Act requires the Grievance Officer route to actually resolve complaints within statutory time.
2. **Register the domain & SPF/DKIM/DMARC** if you're going to send transactional email from the platform. Currently emails are drafted and copy-pasted, so this is "soon", not "blocking".
3. **Add a privacy contact in your sub-processor agreements** — note your Vercel, Neon, PostHog, Anthropic accounts. Most have one-click DPAs in their dashboards; sign each.
4. **Backup verification** — test restoring a Neon backup from the dashboard once so you know the path on day 1 of an incident.
5. **Confirm `NEXT_PUBLIC_APP_URL`** is set in Vercel (used by `robots.ts` + `sitemap.ts`).

### Before paid launch (USA)
1. **CCPA / CPRA** — add a "Do Not Sell or Share My Personal Information" link in the footer. We don't sell data, but the law still requires the link.
2. **State-level US privacy laws** — Virginia/Colorado/Connecticut have similar regimes. Add a US addendum to the Privacy Policy.
3. **Sub-processor list** — many enterprise buyers will ask for a formal one. The list in `/privacy` §6 is fine for solo recruiters but you'll want a downloadable PDF before B2B sales.
4. **SOC 2 readiness** — at the paid tier, customers will ask. Start a vendor questionnaire (Vanta / Drata) early; logging + access reviews are the long-pole items.
5. **Insurance** — E&O + cyber liability. Premiums are cheap pre-revenue and required by larger US buyers.

### Soon (within 30 days of launch)
- **Rate limiting on AI endpoints** — `assertUnderCap` checks monthly quota but not per-minute burst. Add Upstash or Vercel's built-in rate-limit on `/api/bulk/process/*` to defend against runaway costs.
- **Error monitoring** — wire Sentry. Right now any unhandled error in a server action silently 500s.
- **Audit logging** — keep a `prisma.auditLog` of who deleted what & when. DPDP doesn't strictly require it for processors, but it's invaluable when a candidate disputes a deletion.
- **CSP nonces** — current CSP allows `'unsafe-inline'` on script-src because of Next.js runtime. Switching to nonces tightens this further.

---

## 🚫 Explicit out-of-scope (document for clarity)

- **Candidate-facing portal** — no public sign-up, no candidate logins.
- **Payments / billing** — free tier only at launch; PCI scope is N/A until paid tier.
- **Resume PII redaction** — we store full resume text; recruiters expect this. Users should not upload health/financial/government-ID data (called out in §3.2 of Privacy Policy).

---

## 📁 Files added or modified

```
app/(legal)/layout.tsx                # shared header/footer for legal pages
app/(legal)/privacy/page.tsx
app/(legal)/terms/page.tsx
app/(legal)/dpa/page.tsx
app/robots.ts
app/sitemap.ts
app/api/account/export/route.ts
app/(dashboard)/settings/danger-zone.tsx
app/(dashboard)/settings/actions.ts   # +deleteMyAccount
app/(dashboard)/settings/page.tsx     # +Your data & account card
app/(dashboard)/layout.tsx            # +legal links + Manage cookies
app/page.tsx                          # footer links wired up
app/login/page.tsx                    # consent line wired up
app/layout.tsx                        # mount CookieConsent
app/globals.css                       # .legal-doc typography
components/cookie-consent.tsx
components/posthog-provider.tsx       # opt-out by default
lib/parse-file.ts                     # 10MB cap + MIME whitelist
middleware.ts                         # explicit public path list
next.config.mjs                       # security headers
```
