"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteDocument, renameDocument } from "@/actions/documents";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { CardPermissions } from "@/lib/document-access";

type Doc = {
  id: string;
  title: string;
  updatedAt: Date;
  owner: { name: string };
};

export type DocumentCardVariant = "owned" | "shared";

const variantStyles: Record<
  DocumentCardVariant,
  { card: string; badge: string; accent: string }
> = {
  owned: {
    card: "border-brand-200 bg-white ring-1 ring-brand-100/80 hover:border-brand-300 hover:shadow-md",
    badge: "bg-brand-100 text-brand-800",
    accent: "border-l-4 border-l-brand-500",
  },
  shared: {
    card: "border-violet-200 bg-violet-50/60 hover:border-violet-300 hover:shadow-md",
    badge: "bg-violet-100 text-violet-800",
    accent: "border-l-4 border-l-violet-500",
  },
};

export function DocumentCard({
  doc,
  badge,
  permissions,
  variant,
}: {
  doc: Doc;
  badge?: string;
  permissions: CardPermissions;
  variant: DocumentCardVariant;
}) {
  const styles = variantStyles[variant];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updated = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(doc.updatedAt));

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteDocument(doc.id);
      if (result.success) {
        setDeleteOpen(false);
        router.refresh();
      } else {
        setError(result.error);
        setDeleteOpen(false);
      }
    });
  }

  function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || trimmed === doc.title) {
      setRenaming(false);
      setTitle(doc.title);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await renameDocument(doc.id, trimmed);
      if (result.success) {
        setRenaming(false);
        router.refresh();
      } else {
        setError(result.error);
        setTitle(doc.title);
      }
    });
  }

  const displayBadge =
    variant === "shared" ? (badge ?? "View only") : badge;

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition ${styles.card} ${styles.accent}`}
    >
      <div className="flex items-start justify-between gap-2">
        {renaming ? (
          <form onSubmit={handleRenameSubmit} className="min-w-0 flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
              autoFocus
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm font-semibold focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              aria-label="Rename document"
            />
            <div className="mt-2 flex gap-2">
              <Button type="submit" disabled={pending} className="py-1 px-2 text-xs">
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                className="py-1 px-2 text-xs"
                onClick={() => {
                  setRenaming(false);
                  setTitle(doc.title);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Link
            href={permissions.canOpen ? `/documents/${doc.id}` : "#"}
            className="min-w-0 flex-1"
            onClick={(e) => !permissions.canOpen && e.preventDefault()}
          >
            <h3
              className={`font-semibold line-clamp-1 ${
                variant === "owned"
                  ? "text-slate-900 hover:text-brand-700"
                  : "text-violet-950 hover:text-violet-700"
              }`}
            >
              {doc.title}
            </h3>
          </Link>
        )}
        {displayBadge && !renaming && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
          >
            {displayBadge}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Owner: {doc.owner.name} · Updated {updated}
      </p>

      <p className="mt-1 text-xs text-slate-500">{permissionHint(permissions, variant)}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-3">
        {permissions.canOpen && (
          <Link href={`/documents/${doc.id}`}>
            <Button
              variant="secondary"
              className={`py-1.5 px-3 text-xs ${
                variant === "shared" ? "border-violet-200 bg-white text-violet-800" : ""
              }`}
              disabled={pending}
            >
              {variant === "shared" ? "View" : "Open"}
            </Button>
          </Link>
        )}
        {permissions.canRename && !renaming && (
          <Button
            variant="ghost"
            className="py-1.5 px-3 text-xs"
            disabled={pending}
            onClick={() => setRenaming(true)}
          >
            Rename
          </Button>
        )}
        {permissions.canDelete && (
          <Button
            variant="danger"
            className="py-1.5 px-3 text-xs"
            disabled={pending}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete document?"
        description={
          <>
            <span className="font-medium text-slate-800">&ldquo;{doc.title}&rdquo;</span> will be
            permanently removed. Anyone you shared it with will lose access.
          </>
        }
        confirmLabel="Delete document"
        loading={pending}
        onCancel={() => !pending && setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />

      {error && (
        <div className="mt-2">
          <Alert>{error}</Alert>
        </div>
      )}
    </div>
  );
}

function permissionHint(
  permissions: CardPermissions,
  variant: DocumentCardVariant
): string {
  if (permissions.access === "owner" || variant === "owned") {
    return "You own this document · full edit, share, and delete";
  }
  if (permissions.access === "shared" || variant === "shared") {
    return "Shared with you · view only (read-only)";
  }
  return "";
}
