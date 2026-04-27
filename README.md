# Unstuck

A mobile-friendly web app for adults with ADHD that helps them get moving when their brain won't. A single "I'm Stuck" button triages _why_ the user is frozen — overwhelmed, bored, scared, or tired — and routes them to the right tool: an AI task breakdown, a focus session with a visible timer, an always-available body-double chat, or permission to rest. Warm, calm, and deliberately different from the sterile/cartoony alternatives.

---

## Local setup

Requires **Node.js 18.17+** (Next.js 14 minimum). An [Anthropic API key](https://console.anthropic.com/) is required.

```bash
# 1. Clone and install
git clone <your-fork-or-repo-url> unstuck
cd unstuck
npm install

# 2. Add your API key
cp .env.example .env.local
# then edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The marketing landing lives at `/`, and the app itself at `/app`.

---

## Deploy to Vercel

One-click deploy (replace the URL with your own repo after you push):

```
https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/unstuck&env=ANTHROPIC_API_KEY
```

**Or manually:**

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In **Environment Variables**, add `ANTHROPIC_API_KEY` with your key.
4. Click **Deploy**. That's it — no database, no extra config.

---

## Data storage

This MVP stores everything in the browser's **localStorage** — tasks, streaks, focus stats, coach conversation, preferences. That means:

- No database, no auth, no backend state.
- Data is device-specific — clearing browser storage wipes it.
- Conversations with the coach never touch a database; the server only sees what's sent per-request.

This is a deliberate choice for shipping speed. A future version will optionally sync to a backend for cross-device use.

---

## Project structure

```
app/
  page.tsx                  # marketing landing
  layout.tsx                # root layout (fonts, globals)
  globals.css
  app/                      # the actual product lives under /app
    layout.tsx              # top + bottom nav
    page.tsx                # home — I'm Stuck button, stats, current task
    breakdown/page.tsx      # task input + AI breakdown
    focus/page.tsx          # timer + checklist + celebration
    coach/page.tsx          # body-double chat
  api/
    breakdown/route.ts      # POST { title, spiciness } → { steps: string[] }
    coach/route.ts          # POST { messages } → { reply: string }
components/
  app-nav.tsx               # desktop top nav + mobile bottom nav
  stuck-flow.tsx            # the triage modal
lib/
  anthropic.ts              # SDK client + MODEL constant
  storage.ts                # localStorage helpers, types
  utils.ts                  # cn() class merger
```

---

## Tech stack

- **Next.js 14.2.15** (App Router) + TypeScript
- **Tailwind CSS v3** with custom cream / rust / sage / ink palette
- **Fraunces** (display) + **DM Sans** (body) via `next/font/google`
- **Anthropic SDK** (`@anthropic-ai/sdk` ^0.30.1) calling **Claude Sonnet 4.5**
- **lucide-react** for icons

---

## Design notes

The aesthetic is intentional: warm cream background, terracotta accent, soft sage, editorial serif display font. A faint paper-grain overlay gives it tactility. No purple gradients, no cartoon mascots, no clinical blues. It should feel like a well-made notebook, not a productivity dashboard.

Colors (see `tailwind.config.ts`):

- `cream-{50,100,200,300}` — backgrounds, layers
- `rust-{400,500,600,700}` — accent, CTAs
- `sage-{400,500,600}` — success states
- `ink`, `ink-muted`, `ink-light` — text

Made with care, not urgency.
