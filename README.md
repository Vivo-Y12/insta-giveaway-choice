# Insta Giveaway Choice

A fair, transparent, **cryptographically-secure** Instagram giveaway winner picker.
Paste your comments, set the rules, and draw random winners with an animated
slot-reel reveal and confetti.

![Insta Giveaway Choice](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **3-step flow** — Entries → Rules → Draw
- **Multi-format parser** — accepts `username: comment`, `@user comment`,
  `user, comment`, `user | comment`, or bare `username` lines
- **File upload** — drag-and-drop or browse `.txt` / `.csv` (up to 5 MB)
- **Rules engine** — primary winners (1–10), backups (0–10), hashtag / @mention
  / keyword filters with ANY / ALL match mode, unique-participants and
  unique-entries dedupe
- **Fair randomness** — `crypto.getRandomValues` with rejection sampling
  (no modulo bias) + Fisher–Yates shuffle
- **Animated reveal** — spinning slot-reel (~3.2 s) → gradient winner cards
  with crown + comment preview
- **Confetti** — canvas-based two-cannon burst on reveal (no extra deps)
- **Export** — Copy results to clipboard, download as `.txt`
- **Responsive** — mobile-first, works on phone and desktop
- **No backend required** — 100% client-side; no Instagram API key needed

## Quick start

```bash
bun install
bun run dev
```

Open <http://localhost:3000>.

Click **Sample data → Continue → Pick winner** to see the full draw animation.

## How winners are picked

1. Your pasted text is parsed into `{ username, comment, raw }` entries.
2. Rules are applied (filters + dedupe) to produce the qualified pool.
3. The pool is shuffled with a Fisher–Yates shuffle driven by
   `crypto.getRandomValues`, using **rejection sampling** so the result has no
   modulo bias.
4. The first N entries become primary winners; the next M become backups.

The draw happens entirely in your browser — the entries never leave your
machine.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript 5
- Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com/) (New York)
- Zustand for client state
- Framer Motion for animations
- Lucide icons

## Project structure

```
src/
  app/                      # Next.js route + layout
  components/
    giveaway/               # App shell, steps, confetti
      GiveawayApp.tsx
      EntriesStep.tsx
      RulesStep.tsx
      DrawStep.tsx
      Confetti.tsx
    ui/                     # shadcn/ui component library
  lib/
    giveaway/
      types.ts              # Entry, Rules, WinnerResult
      parser.ts             # paste → Entry[]
      picker.ts             # rules + crypto-secure random pick
      store.ts              # Zustand store
  hooks/
prisma/schema.prisma        # (unused by giveaway logic; scaffold)
```

## Input formats

| Format                | Example                                    |
|-----------------------|--------------------------------------------|
| Colon                 | `alex_w: Love this! @sarah_j #giveaway`   |
| Leading @mention      | `@alex_w Love this! #giveaway`             |
| CSV                   | `alex_w,Love this! #giveaway`              |
| Pipe                  | `alex_w \| Love this! #giveaway`           |
| Bare username         | `alex_w`                                   |

## License

MIT
