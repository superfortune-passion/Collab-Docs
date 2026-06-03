import { describe, it, expect } from "vitest";
import {
  canDeleteDocument,
  canEditDocument,
  canShareDocument,
  canViewDocument,
  getCardPermissions,
  getDocumentAccess,
} from "./document-access";
import type { DocumentWithShares } from "./document-access";

function mockDoc(
  ownerId: string,
  sharedUserIds: string[] = []
): DocumentWithShares {
  return {
    id: "doc-1",
    title: "Test",
    content: "{}",
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    shares: sharedUserIds.map((userId) => ({
      id: `share-${userId}`,
      documentId: "doc-1",
      userId,
      createdAt: new Date(),
    })),
  };
}

describe("document access", () => {
  const alice = "alice-id";
  const bob = "bob-id";
  const carol = "carol-id";

  it("grants owner full access", () => {
    const doc = mockDoc(alice, [bob]);
    expect(getDocumentAccess(doc, alice)).toBe("owner");
    expect(canViewDocument(doc, alice)).toBe(true);
    expect(canEditDocument(doc, alice)).toBe(true);
    expect(canShareDocument(doc, alice)).toBe(true);
    expect(canDeleteDocument(doc, alice)).toBe(true);
    const perms = getCardPermissions(doc, alice);
    expect(perms.canOpen).toBe(true);
    expect(perms.canRename).toBe(true);
    expect(perms.canDelete).toBe(true);
  });

  it("grants shared user view-only access (no edit, share, or delete)", () => {
    const doc = mockDoc(alice, [bob]);
    expect(getDocumentAccess(doc, bob)).toBe("shared");
    expect(canViewDocument(doc, bob)).toBe(true);
    expect(canEditDocument(doc, bob)).toBe(false);
    expect(canShareDocument(doc, bob)).toBe(false);
    expect(canDeleteDocument(doc, bob)).toBe(false);
    const perms = getCardPermissions(doc, bob);
    expect(perms.canOpen).toBe(true);
    expect(perms.canRename).toBe(false);
    expect(perms.canDelete).toBe(false);
    expect(perms.canEdit).toBe(false);
  });

  it("denies access to unrelated users", () => {
    const doc = mockDoc(alice, [bob]);
    expect(getDocumentAccess(doc, carol)).toBe("none");
    expect(canViewDocument(doc, carol)).toBe(false);
    expect(canEditDocument(doc, carol)).toBe(false);
  });

  it("denies access when user is null", () => {
    const doc = mockDoc(alice);
    expect(getDocumentAccess(doc, null)).toBe("none");
    expect(canViewDocument(doc, null)).toBe(false);
  });
});
