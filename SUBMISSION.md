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
- Bob sees **Team Notes** under **Shared With Me**

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
- [ ] Bob cannot share Alice’s doc (share buttons only for owner)
- [ ] Unauthorized document URL shows not-found state
- [ ] Import rejects unsupported file types (e.g. `.pdf`)
- [ ] README links open correctly

## Out of scope (by design)

- Real-time collaborative editing
- Full authentication / OAuth
- Granular permissions beyond owner vs shared view-only access
