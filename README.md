# Smart ATS

AI-powered applicant tracking system for recruiters. Three core features:

1. **Job intake bot** — paste a messy JD, get a LinkedIn boolean string + candidate persona summary.
2. **Screening to sheet** — upload a resume (PDF/DOCX/TXT) or paste call notes, get clean structured data + a 0–100 match score vs. the JD.
3. **Coordinator** — approve a candidate, drop your Calendly/cal.com link once, AI drafts a scheduling email you can copy/paste or open in your mail client.

Built with Next.js 15 (App Router) · TypeScript · Tailwind + shadcn/ui · Prisma + Postgres · NextAuth v5 (Google) · Anthropic Claude.

---

## 1. Local setup

### Prerequisites
- Node 20+ (tested on 25)
- A Postgres database — easiest is a free [Neon](https://neon.tech) database
- A Google OAuth client — [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
- An Anthropic API key — [console.anthropic.com](https://console.anthropic.com/settings/keys)

### Steps

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env.local
# Then edit .env.local — see "Environment variables" below.

# 3. Push the schema to your database
npx prisma db push

# 4. Run dev server
npm run dev
```

Open http://localhost:3000 — sign in with Google, land in the dashboard.

---

## 2. Environment variables

Copy `.env.example` → `.env.local` and fill in:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Postgres connection string (e.g. from Neon — must include `?sslmode=require`) |
| `AUTH_SECRET` | Random secret. Generate with `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` in dev, your prod URL in prod |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `ANTHROPIC_API_KEY` | Claude API key |
| `USAGE_CAP_PER_MONTH` | Per-user monthly AI call cap (default 100) |
| `USAGE_WARN_BUFFER` | Show warning banner when remaining ≤ this (default 10) |

### Setting up Google OAuth

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. **Create credentials → OAuth client ID** → Web application.
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://YOUR-PROD-DOMAIN/api/auth/callback/google` (prod)
4. Copy the client ID + secret into `.env.local`.

---

## 3. Deploying to Vercel + Neon

### One-time setup
1. Push this repo to GitHub.
2. Create a free Postgres database on [Neon](https://neon.tech). Copy the connection string.
3. Go to [vercel.com/new](https://vercel.com/new), import the GitHub repo.
4. In Vercel project settings → **Environment Variables**, add every variable from `.env.example`. For `AUTH_URL`, use the Vercel deployment URL (e.g. `https://smart-ats.vercel.app`).
5. Add the Vercel URL to Google OAuth's authorized redirect URIs (step above).
6. Deploy.

### Database migrations on deploy
The `build` script runs `prisma generate` automatically. To apply schema changes in production:

```bash
# From your machine, with prod DATABASE_URL set:
npx prisma db push
```

Or use Prisma migrations (`npx prisma migrate deploy` in a Vercel build hook) once your schema stabilizes.

---

## 4. Architecture

```
app/
├── (dashboard)/                   # Protected via middleware
│   ├── dashboard/                 # Overview
│   ├── jobs/{,/new,/[id]}/        # Feature 1
│   ├── candidates/{,/new,/[id]}/  # Feature 2 + 3 (Coordinator on approval)
│   ├── pipeline/                  # Kanban-style board
│   └── settings/                  # Booking link + account
├── api/
│   ├── auth/[...nextauth]/        # NextAuth handler
│   └── candidates/export.csv/     # CSV download
├── login/
├── layout.tsx, page.tsx (landing)
auth.ts                            # NextAuth config (Google + Prisma)
middleware.ts                      # Route protection
lib/
├── ai.ts                          # Anthropic client + JSON helper
├── ai/{jd,resume,email}.ts        # Per-feature prompts
├── db.ts                          # Prisma singleton
├── parse-file.ts                  # PDF/DOCX/TXT → text
├── usage.ts                       # Usage cap + meter
└── utils.ts
prisma/schema.prisma
components/{ui/*, copy-button, usage-banner}
```

### Usage caps
Each AI call (`createJobFromJD`, `createCandidate`, `generateSchedulingEmail`, `reanalyzeJob`) checks the current month's `UsageMeter` row before firing. When remaining ≤ `USAGE_WARN_BUFFER`, a yellow banner appears at the top of every dashboard page. At cap, a red banner appears and AI calls return an error.

### AI model
All calls go to `claude-sonnet-4-6` via `@anthropic-ai/sdk`. Prompts ask for JSON output and the helper in `lib/ai.ts` handles fence-stripping + fallback extraction.

---

## 5. Roadmap (not yet built)
- Voice-note JD intake (Whisper or browser SpeechRecognition)
- Email send via Resend (currently copy/paste only)
- Multi-tenant (recruiter teams)
- More OAuth providers (Facebook, LinkedIn)
- Bulk resume upload (CSV / zip)
- Editable extracted fields on candidate detail page
