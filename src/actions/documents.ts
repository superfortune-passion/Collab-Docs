"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  canDeleteDocument,
  canEditDocument,
  canShareDocument,
  getDocumentAccess,
} from "@/lib/document-access";
import { AppError, toActionError } from "@/lib/errors";
import { getCurrentUserId } from "@/lib/session";
import {
  documentContentSchema,
  documentTitleSchema,
  shareUserIdSchema,
} from "@/lib/validations";

async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new AppError("Please select a user to continue.", "UNAUTHORIZED");
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("Selected user not found. Please switch user.", "UNAUTHORIZED");
  }
  return userId;
}

async function getDocumentForAccess(documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { shares: true },
  });
  if (!doc) {
    throw new AppError("Document not found.", "NOT_FOUND");
  }
  return doc;
}

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function createDocument(): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const doc = await prisma.document.create({
      data: {
        title: "Untitled Document",
        content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
        ownerId: userId,
      },
    });
    revalidatePath("/");
    return { success: true, data: { id: doc.id } };
  } catch (e) {
    const { error } = toActionError(e);
    return { success: false, error };
  }
}

export async function renameDocument(
  documentId: string,
  title: string
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = documentTitleSchema.safeParse(title);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Invalid title", "VALIDATION");
    }

    const doc = await getDocumentForAccess(documentId);
    if (!canEditDocument(doc, userId)) {
      throw new AppError(
        "You can only view this document. Shared access is read-only.",
        "FORBIDDEN"
      );
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { title: parsed.data },
    });
    revalidatePath("/");
    revalidatePath(`/documents/${documentId}`);
    return { success: true };
  } catch (e) {
    const { error } = toActionError(e);
    return { success: false, error };
  }
}

export async function saveDocument(
  documentId: string,
  content: string
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = documentContentSchema.safeParse(content);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Invalid content", "VALIDATION");
    }

    const doc = await getDocumentForAccess(documentId);
    if (!canEditDocument(doc, userId)) {
      throw new AppError(
        "You can only view this document. Shared access is read-only.",
        "FORBIDDEN"
      );
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { content: parsed.data },
    });
    revalidatePath(`/documents/${documentId}`);
    return { success: true };
  } catch (e) {
    const { error } = toActionError(e);
    return { success: false, error };
  }
}

export async function deleteDocument(documentId: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const doc = await getDocumentForAccess(documentId);
    if (!canDeleteDocument(doc, userId)) {
      throw new AppError("Only the document owner can delete this document.", "FORBIDDEN");
    }

    await prisma.document.delete({ where: { id: documentId } });
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    const { error } = toActionError(e);
    return { success: false, error };
  }
}

export async function shareDocument(
  documentId: string,
  targetUserId: string
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = shareUserIdSchema.safeParse(targetUserId);
    if (!parsed.success) {
      throw new AppError("Invalid user selected.", "VALIDATION");
    }

    const doc = await getDocumentForAccess(documentId);
    if (!canShareDocument(doc, userId)) {
      throw new AppError("Only the owner can share this document.", "FORBIDDEN");
    }

    if (parsed.data === userId) {
      throw new AppError("You cannot share a document with yourself.", "VALIDATION");
    }

    if (doc.ownerId === parsed.data) {
      throw new AppError("The owner already has access.", "VALIDATION");
    }

    const target = await prisma.user.findUnique({ where: { id: parsed.data } });
    if (!target) {
      throw new AppError("User not found.", "NOT_FOUND");
    }

    await prisma.share.create({
      data: { documentId, userId: parsed.data },
    });
    revalidatePath("/");
    revalidatePath(`/documents/${documentId}`);
    return { success: true };
  } catch (e) {
    const { error } = toActionError(e);
    return { success: false, error };
  }
}

export async function getDashboardData(userId: string | null) {
  if (!userId) {
    return { user: null, owned: [], shared: [], allUsers: [] };
  }

  const [user, owned, shared, allUsers] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      include: { owner: true, shares: { include: { user: true } } },
    }),
    prisma.document.findMany({
      where: {
        shares: { some: { userId } },
        NOT: { ownerId: userId },
      },
      orderBy: { updatedAt: "desc" },
      include: { owner: true, shares: { include: { user: true } } },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { user, owned, shared, allUsers };
}

export async function getDocumentPageData(documentId: string, userId: string | null) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: true,
      shares: { include: { user: true } },
    },
  });

  if (!doc) return { doc: null, access: "none" as const, allUsers: [] };

  const withShares = { ...doc, shares: doc.shares };
  const accessLevel = getDocumentAccess(withShares, userId);
  if (accessLevel === "none") {
    return { doc: null, access: "none" as const, allUsers: [] };
  }

  const allUsers = await prisma.user.findMany({ orderBy: { name: "asc" } });
  const access = accessLevel === "owner" ? ("owner" as const) : ("shared" as const);

  return { doc, access, allUsers };
}
