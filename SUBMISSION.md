# Submission Checklist

## Included deliverables

| Item | Location |
|------|----------|
| Next.js 14 App Router app | `src/app/` |
| TypeScript | `tsconfig.json`, `src/**/*.ts(x)` |
| Tailwind CSS | `tailwind.config.ts`, `src/app/globals.css` |
| Prisma + SQLite | `prisma/schema.prisma`, `prisma/dev.db` (after setup) |
| Tiptap editor | `src/components/DocumentEditor.tsx` |
| Automated tests (Vitest) | `src/lib/*.test.ts` (7 tests: access, import validation, merge) |
| README | `README.md` |
| Architecture notes | `ARCHITECTURE.md` |
| AI workflow notes | `AI_WORKFLOW.md` |
| This submission doc | `SUBMISSION.md` |

## Core requirements coverage

- [x] Create, rename, edit, save, reopen documents
- [x] Rich text: bold, italic, underline, headings, bullet/numbered lists
- [x] Import `.txt`, `.md`, and `.docx` via upload (dashboard + editor attach/replace)
- [x] Mock users Alice & Bob with header switcher
- [x] Owner + share model; dashboard **My Documents** / **Shared With Me**
- [x] SQLite persistence for users, documents, shares, content
- [x] Validation and error handling
- [x] Empty, loading, and error states

## Seeded users

| Name | Email |
|------|-------|
| Alice | alice@example.com |
| Bob | bob@example.com |

After `npm run db:seed`:

- Alice owns **Getting Started** and **Team Notes (shared with Bob)**
- Bob sees **Team Notes** under **Shared With Me** (read-only — no edit, save, share, or import)

## Sharing and import (reviewer notes)

| Behavior | Implementation |
|----------|----------------|
| **Shared access** | View-only: Bob can open shared docs but cannot edit body, rename, save, import, share, or delete |
| **Owner access** | Full edit, share, delete, and file import (new / attach / replace) |
| **Import formats** | `.txt`, `.md`, `.docx` — dashboard creates a new doc; editor attach/replace requires owner |

## Local instructions (quick)

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Tests: `npm test`  
Build: `npm run build`

## Demo video (3–5 min)

**Full click-by-click script:** [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)

**One command to start recording setup:**

```powershell
npm run demo
```

Opens the browser and starts the dev server. Read `DEMO_SCRIPT.md` while you screen-record.

## Placeholders (fill before submit)

| Field | Value |
|-------|-------|
| Live URL | _TODO: e.g. https://your-app.vercel.app_ |
| Walkthrough video URL | _TODO: e.g. https://loom.com/share/..._ |
| Repository URL | _TODO if different from submission portal_ |

## Manual checks before submit

- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] Fresh clone: install → db:push → db:seed → dev works
- [ ] User switcher persists across navigation
- [ ] **Bob view-only:** open **Team Notes** as Bob → “View only” banner, no toolbar save/import, editor is read-only
- [ ] Bob cannot share, rename, or delete Alice’s documents (owner-only actions)
- [ ] Unauthorized document URL shows not-found state
- [ ] **Import `.docx`:** dashboard import of a `.docx` creates a document with content
- [ ] Import rejects unsupported file types (e.g. `.pdf`)
- [ ] README and doc links open correctly (`DEMO_SCRIPT.md`, `ARCHITECTURE.md`, etc.)

## Deployment (fill Live URL above)

- **Local / demo:** SQLite via `DATABASE_URL="file:./dev.db"` (included in `.env.example`)
- **Hosted (e.g. Vercel):** use PostgreSQL — SQLite is not suitable for serverless production; run `prisma db push` or migrations and `prisma db seed` on deploy

## Out of scope (by design)

- Real-time collaborative editing
- Full authentication / OAuth (mock Alice/Bob switcher instead)
- Shared users as co-editors (shared access is **view-only** for a clearer demo)
