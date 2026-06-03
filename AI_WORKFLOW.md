# AI Workflow (Cursor)

This document describes how Cursor was used to build this take-home honestly and professionally.

## How I used Cursor

1. **Scoping first** — Pasted the full assignment prompt and asked for a minimal architecture (data model, routes, what to skip). Locked scope: no realtime, no real auth, one meaningful test.

2. **Scaffold in layers** — Generated `package.json`, Prisma schema, and seed before UI so persistence and demo data were stable early.

3. **Pure logic separately** — Implemented `document-access.ts` and Vitest tests in isolation so sharing rules could be verified without running the browser.

4. **Server actions before polish** — CRUD, share, and import API were wired with Zod validation before spending time on Tailwind details.

5. **Iterative UI** — Dashboard empty states, editor toolbar, and share panel were refined in follow-up prompts with screenshots or “make demo-friendly” guidance.

6. **Verification prompts** — Asked Cursor to run `npm install`, `db:seed`, `npm test`, and `npm run build`, then fix TypeScript or Prisma errors from real output.

## What worked well

- **Boilerplate speed**: Prisma schema, seed script, and Next.js config were faster than manual setup.
- **Test generation**: Vitest coverage for access control, import filename rules, and merge helpers.
- **Consistency**: Repeated patterns (ActionResult, AppError, EmptyState) across actions and UI.

## What I corrected manually

- **Product judgment**: Removed over-engineered ideas (permission matrices, websockets) when the model suggested them.
- **Tiptap SSR**: Ensured editor components are `"use client"` only; StarterKit extension conflicts resolved by disabling duplicate list/heading extensions.
- **SQLite seed IDs**: Fixed upsert keys for demo documents so re-seeding is idempotent.
- **PowerShell / Windows paths**: Used `Set-Location` and project-local commands instead of bash-only snippets.

## Responsible use

- I reviewed every generated file for security (no secrets committed), access checks on the server, and alignment with assignment requirements.
- Tests prove **sharing access logic**, not AI output — they run in CI/local without LLM involvement.
- Documentation (this file, ARCHITECTURE, README) reflects actual decisions, not marketing copy.

## Tips for similar assignments

1. Give the model the **non-goals** explicitly (no realtime, no OAuth).
2. Ask for **one test file** with named cases you care about.
3. Run **build + seed** before recording your demo video.
4. Keep a short **SUBMISSION.md** checklist so reviewers see everything in one place.

## Limitations

Cursor does not replace running the app: cookie session behavior, Tiptap focus, and import edge cases still need manual clicks before submit.
