# Dashboard permissions report

Actions on each document card are enforced in **two places**:

1. **UI** — buttons shown or hidden via `getCardPermissions()`
2. **Server** — `renameDocument` and `deleteDocument` re-check access (never trust the client)

## Permission matrix

| Role | Section | Open/View | Rename (card) | Delete (card) | Share (editor) | Edit body (editor) |
|------|---------|-----------|---------------|---------------|----------------|-------------------|
| **Owner** | My Documents | Yes | Yes | Yes | Yes | Yes |
| **Shared user** | Shared With Me | Yes (View) | **No** | **No** | No | **No (read-only)** |
| **Other user** | — | No | No | No | No | No |
| **No user selected** | — | No | No | No | No | No |

## Card buttons

| Button | What it does | Who sees it |
|--------|----------------|-------------|
| **Open** | Opens the rich-text editor | Owner and shared users |
| **Rename** | Inline title edit on the dashboard | Owner only |
| **View** | Opens read-only editor | Shared users |
| **Delete** | Removes document and all shares (confirm dialog) | **Owner only** |

## Server error messages

| Action | Denied when |
|--------|-------------|
| Rename / save | Not owner → “You can only view this document. Shared access is read-only.” |
| Delete | Not owner → “Only the document owner can delete this document.” |

## Code locations

| File | Purpose |
|------|---------|
| `src/lib/document-access.ts` | `canDeleteDocument`, `getCardPermissions` |
| `src/lib/document-access.test.ts` | Unit tests for delete + card permissions |
| `src/actions/documents.ts` | `deleteDocument` server action |
| `src/components/DocumentCard.tsx` | Open / Rename / Delete UI |

## File import

| Location | Action |
|----------|--------|
| Dashboard **Import file** | Creates a **new** document from `.txt`, `.md`, or `.docx` |
| Editor **Attach file** | Appends imported content to the **current** document (requires edit permission) |
| Editor **Replace from file** | Replaces entire body (owner only; confirm dialog) |

## Tests

```bash
npm test
```

Includes cases: owner can delete; shared user cannot delete.
