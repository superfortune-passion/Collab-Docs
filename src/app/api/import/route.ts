import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canEditDocument } from "@/lib/document-access";
import { fileToTiptapContent } from "@/lib/import-content";
import {
  mergeDocumentContent,
  replaceDocumentContent,
} from "@/lib/merge-document-content";
import { getCurrentUserId } from "@/lib/session";
import {
  getImportBaseName,
  getImportFileKind,
  getMaxImportBytes,
  type ImportMode,
  validateImportFilename,
} from "@/lib/validations";

function parseImportMode(value: FormDataEntryValue | null): ImportMode {
  if (value === "attach" || value === "replace") return value;
  return "new";
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Please select a user first." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Invalid session user." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const mode = parseImportMode(formData.get("mode"));
    const documentId = formData.get("documentId")?.toString() ?? null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!validateImportFilename(file.name)) {
      return NextResponse.json(
        { error: "Supported files: .txt, .md, and .docx" },
        { status: 400 }
      );
    }

    const kind = getImportFileKind(file.name)!;
    const maxBytes = getMaxImportBytes(kind);
    if (file.size > maxBytes) {
      const limitLabel = kind === "docx" ? "5MB" : "500KB";
      return NextResponse.json({ error: `File is too large (max ${limitLabel}).` }, { status: 400 });
    }

    if ((mode === "attach" || mode === "replace") && !documentId) {
      return NextResponse.json({ error: "Document ID is required for this import mode." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const importedContent = await fileToTiptapContent(buffer, file.name, kind);

    if (mode === "new") {
      const title = getImportBaseName(file.name).slice(0, 200);
      const doc = await prisma.document.create({
        data: { title, content: importedContent, ownerId: userId },
      });
      return NextResponse.json({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        mode: "new",
      });
    }

    const existing = await prisma.document.findUnique({
      where: { id: documentId! },
      include: { shares: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (!canEditDocument(existing, userId)) {
      return NextResponse.json(
        { error: "You do not have permission to modify this document." },
        { status: 403 }
      );
    }

    const nextContent =
      mode === "attach"
        ? mergeDocumentContent(existing.content, importedContent)
        : replaceDocumentContent(importedContent);

    const doc = await prisma.document.update({
      where: { id: documentId! },
      data: { content: nextContent },
    });

    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      mode,
    });
  } catch (error) {
    console.error("Import failed:", error);
    return NextResponse.json({ error: "Import failed. Please try again." }, { status: 500 });
  }
}
