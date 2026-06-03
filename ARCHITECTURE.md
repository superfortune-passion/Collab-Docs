# Architecture

## Goals and priorities

This project optimizes for a **reviewable product slice** in a fixed timebox:

1. End-to-end flows that work in a 3–5 minute demo video
2. Clear separation of owned vs shared documents on the dashboard
3. Honest scope boundaries (no realtime collab, no real auth)

Deferred intentionally: version history, comments, granular roles (viewer/editor), full-text search, and operational hardening beyond basic validation.

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| UI | Next.js 14 App Router + React | Server components for dashboard; client components for Tiptap |
| Styling | Tailwind CSS | Fast, consistent layout without a heavy design system |
| API | Server Actions + one REST route | Actions for CRUD/share; `/api/import` for `multipart/form-data` |
| DB | Prisma + SQLite | Zero-config local persistence; easy seeding for reviewers |
| Editor | Tiptap (ProseMirror) | Mature rich-text; JSON document storage |
| Tests | Vitest | Fast unit tests for pure access-control logic |

## Data model

```
User ──owns──> Document
User <──shares── Share ──> Document
```

- **User**: seeded Alice and Bob; identified in UI via HTTP-only cookie (`collab-docs-user-id`).
- **Document**: `title`, Tiptap `content` as JSON string, `ownerId`, timestamps.
- **Share**: unique `(documentId, userId)` — grants **view-only** access (not co-edit).

Access rules (`src/lib/document-access.ts`):

- **Owner**: view, edit, share, delete
- **Shared user**: view only (read-only editor; cannot rename, save, import, share, or delete)
- **Everyone else**: no access

## Request flow

### Dashboard

1. Layout loads all users + current session cookie.
2. `page.tsx` calls `getDashboardData(userId)` — parallel Prisma queries for owned and shared lists.

### Editor

1. `documents/[id]/page.tsx` loads document with owner and shares; returns empty state if no access.
2. `DocumentEditor` (client) initializes Tiptap from stored JSON.
3. **Owners:** auto-save debounces `saveDocument` (800ms); manual “Save now”; title blur calls `renameDocument`; attach/replace import in toolbar.
4. **Shared users:** editor is read-only (`editable: false`); no save, rename, or import controls; “View only” banner shown.

### Import

1. Client posts file to `POST /api/import`.
2. Server validates extension, size, session user.
3. `fileToTiptapContent` converts `.txt` / light `.md` / `.docx` (via mammoth + HTML) into Tiptap JSON.
4. **New** mode creates a document; **attach** / **replace** merge or overwrite existing content (owner only).

### Sharing

1. Owner-only `SharePanel` lists users not yet shared.
2. `shareDocument` validates owner, prevents self-share and duplicate shares.

## Validation and errors

- Zod schemas for title, content size, share target IDs.
- `AppError` with codes mapped to user-facing messages in `toActionError`.
- Client alerts for action failures; API JSON errors for import.

## Tradeoffs

| Decision | Benefit | Cost |
|----------|---------|------|
| Cookie-based mock auth | Demo-friendly, no login UI | Not secure; not multi-device |
| JSON content in SQLite | Simple schema; Tiptap-native | Harder to query document text |
| Auto-save debounce | Feels responsive | Possible race if user closes tab instantly |
| Light markdown import | Good enough for .md demo | Not a full markdown parser |
| No migrations folder | Faster setup with `db push` | Production should use proper migrations |

## What I would build next

1. **PostgreSQL + migrations** for deployable persistence
2. **Proper auth** (NextAuth or Clerk) replacing the user switcher
3. **Editable share role** (today shared users are view-only)
4. **Document list search** and pagination
5. **E2E tests** (Playwright) for create → share → edit as second user
6. **Optimistic UI** for save/share with conflict detection if realtime is added later

## Folder map

```
src/
  app/           # Routes, layout, import API
  actions/       # Server actions (documents, session)
  components/    # UI + Tiptap editor
  lib/           # DB, session, access, validation, errors
prisma/          # Schema + seed
```
