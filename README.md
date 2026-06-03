# Collab Docs

A lightweight collaborative document editor inspired by Google Docs. Built as a timeboxed take-home assignment with Next.js, Tiptap, Prisma, and SQLite.

## Features

- Create, rename, edit, save, and reopen rich-text documents
- Formatting: bold, italic, underline, headings (H1–H3), bullet and numbered lists
- Import `.txt`, `.md`, and `.docx` into new documents, or attach/replace content in the open document
- Mock users (Alice & Bob) with a header user switcher — no real authentication
- Document ownership and sharing with **My Documents** vs **Shared With Me** dashboard sections

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
npm install
npm run db:push
npm run db:seed
```

Copy environment config if needed:

```bash
cp .env.example .env
```

Default:

```
DATABASE_URL="file:./dev.db"
```

## Run locally

```bash
npm run dev
```

Open **the URL printed in your terminal** (usually [http://localhost:3000](http://localhost:3000)).

### Page looks unstyled (plain HTML, visible “Choose File”)?

This usually means CSS did not load — often because two dev servers are running:

1. Stop all terminals running `npm run dev`.
2. Run `npm run dev` again (the script frees port 3000 and starts one server).
3. Use **http://localhost:3000** only (not 3001 unless the terminal says so).
4. Hard refresh: **Ctrl+Shift+R** (or clear cache).

If it persists: delete the `.next` folder and run `npm run dev` again.

### Webpack `EBUSY: resource busy or locked` warnings?

Harmless on Windows when disk cache conflicts with antivirus or two dev servers. The project uses in-memory webpack cache in dev and clears old cache on startup. Restart with a single `npm run dev` terminal.

1. Select **Alice** or **Bob** in the header.
2. Explore seeded documents or create a new one.
3. Switch to Bob to see **Shared With Me** (Team Notes).

## Tests

```bash
npm test
```

Runs Vitest unit tests for access control, import validation, and content merge (`src/lib/*.test.ts`).

## Production build

```bash
npm run build
npm start
```

## Reset database

```bash
npm run db:reset
```

## Deployment notes

- **SQLite** works for local demos; for production (e.g. Vercel), switch Prisma to PostgreSQL and set `DATABASE_URL` in the host environment.
- Run `prisma migrate deploy` (or `db push` for prototypes) and `prisma db seed` on deploy.
- Ensure `postinstall` runs `prisma generate` (configured in `package.json`).
- Server Actions require the same `DATABASE_URL` at build and runtime.

## Project docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — design decisions and data model
- [AI_WORKFLOW.md](./AI_WORKFLOW.md) — how Cursor was used for this build
- [SUBMISSION.md](./SUBMISSION.md) — submission checklist and demo users
- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) — walkthrough recording script
- [PERMISSIONS.md](./PERMISSIONS.md) — permission matrix reference

## Record your walkthrough video

See **[DEMO_SCRIPT.md](./DEMO_SCRIPT.md)** for a minute-by-minute script (what to click and what to say).

```powershell
npm run demo
```

## Demo assets

Sample import files in `public/`:

- `public/sample-import.md`
- `public/sample-import.txt`
