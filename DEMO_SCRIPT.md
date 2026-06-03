# Demo walkthrough script (3–5 minutes)

Use this while screen-recording. Start with:

```powershell
npm run demo
```

Select **Alice** in the header unless noted otherwise.

---

## 1. Dashboard and mock users (0:00–0:45)

1. Point out the **user switcher** (Alice / Bob) — mock auth via cookie, no passwords.
2. Show **My Documents** — Alice owns seeded docs (e.g. **Getting Started**, **Team Notes**).
3. Mention **New document** and **Import file** on the right.

**Say:** “Reviewers can switch users to demo ownership and sharing without a login flow.”

---

## 2. Rich-text editing (0:45–1:45)

1. Open **Getting Started** (or create **New document**).
2. Use the toolbar: **bold**, *italic*, underline, **H1–H3**, bullet and numbered lists.
3. Type a short sentence; wait for **All changes saved** (auto-save ~800ms) or click **Save now**.
4. Rename the title in the editor (blur to save).

**Say:** “Content persists as Tiptap JSON in SQLite through server actions with validation.”

---

## 3. Import (1:45–2:30)

1. Return to dashboard → **Import file** → choose `public/sample-import.md` (or `.txt`).
2. Confirm redirect to the new document with imported headings/lists.
3. Optional: on an owned doc, **Attach file** or **Replace from file** in the editor toolbar.

**Say:** “Imports support `.txt`, `.md`, and `.docx` with size limits; attach/replace require owner edit access.”

---

## 4. Sharing (2:30–3:30)

1. Open **Team Notes (shared with Bob)** as Alice.
2. Scroll to **Sharing** — show **Shared with: Bob** or use **Share with Bob** if re-demoing on a fresh doc.
3. Switch header to **Bob**.
4. Show **Shared With Me** → **View** on Team Notes.
5. Open the doc — **View only** banner; editor is read-only (no save, share, or import).

**Say:** “Shared users can open and read but cannot edit; only the owner shares or deletes.”

---

## 5. Access control edge case (3:30–4:00)

1. As Bob, copy a document URL Alice owns but did **not** share.
2. Paste in the address bar → **Document not found** (no leak of title/content).

**Say:** “Server actions and page loaders both enforce `document-access` rules.”

---

## 6. Wrap-up (4:00–4:30)

1. Switch back to Alice → **Delete** a test doc you created (confirm dialog).
2. Mention `npm test` (Vitest) and README setup (`db:push`, `db:seed`).

**Say:** “SQLite is for local demo; production would use PostgreSQL per README deployment notes.”

---

## Pre-recording checklist

- [ ] Single terminal: `npm run dev` (or `npm run demo`)
- [ ] `npm test` and `npm run build` already green
- [ ] Browser at http://localhost:3000
- [ ] Microphone and window size set for recording
