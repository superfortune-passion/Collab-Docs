import type { Document, Share } from "@prisma/client";

export type DocumentWithShares = Document & { shares: Share[] };

export type AccessLevel = "owner" | "shared" | "none";

export function getDocumentAccess(
  document: DocumentWithShares,
  userId: string | null
): AccessLevel {
  if (!userId) return "none";
  if (document.ownerId === userId) return "owner";
  if (document.shares.some((s) => s.userId === userId)) return "shared";
  return "none";
}

export function canViewDocument(
  document: DocumentWithShares,
  userId: string | null
): boolean {
  return getDocumentAccess(document, userId) !== "none";
}

/** Only the owner may edit content or title (shared users are view-only). */
export function canEditDocument(
  document: DocumentWithShares,
  userId: string | null
): boolean {
  return getDocumentAccess(document, userId) === "owner";
}

export function canShareDocument(
  document: DocumentWithShares,
  userId: string | null
): boolean {
  return getDocumentAccess(document, userId) === "owner";
}

/** Only the document owner may delete (shared users cannot remove the document). */
export function canDeleteDocument(
  document: DocumentWithShares,
  userId: string | null
): boolean {
  return getDocumentAccess(document, userId) === "owner";
}

export type CardPermissions = {
  canOpen: boolean;
  canRename: boolean;
  canDelete: boolean;
  canEdit: boolean;
  access: AccessLevel;
};

export function getCardPermissions(
  document: DocumentWithShares,
  userId: string | null
): CardPermissions {
  const access = getDocumentAccess(document, userId);
  const canEdit = canEditDocument(document, userId);
  return {
    access,
    canOpen: canViewDocument(document, userId),
    canRename: canEdit,
    canDelete: canDeleteDocument(document, userId),
    canEdit,
  };
}
