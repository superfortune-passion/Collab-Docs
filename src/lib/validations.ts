import { z } from "zod";

export const documentTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title must be 200 characters or less");

export const documentContentSchema = z.string().max(500_000, "Content is too large");

export const shareUserIdSchema = z.string().cuid("Invalid user");

export const ALLOWED_IMPORT_EXTENSIONS = [".txt", ".md", ".docx"] as const;
export type ImportFileKind = "txt" | "md" | "docx";

export type ImportMode = "new" | "attach" | "replace";

const TEXT_MAX_BYTES = 500_000;
const DOCX_MAX_BYTES = 5_000_000;

export function getImportFileKind(filename: string): ImportFileKind | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".txt")) return "txt";
  if (lower.endsWith(".md")) return "md";
  if (lower.endsWith(".docx")) return "docx";
  return null;
}

export function validateImportFilename(filename: string): boolean {
  return getImportFileKind(filename) !== null;
}

export function getMaxImportBytes(kind: ImportFileKind): number {
  return kind === "docx" ? DOCX_MAX_BYTES : TEXT_MAX_BYTES;
}

export function getImportBaseName(filename: string): string {
  return filename.replace(/\.(txt|md|docx)$/i, "").trim() || "Imported Document";
}

export function parseImportToDocContent(raw: string, isMarkdown: boolean): string {
  const lines = raw.split(/\r?\n/);
  const nodes: object[] = [];

  for (const line of lines) {
    if (isMarkdown && /^#{1,3}\s+/.test(line)) {
      const level = (line.match(/^#+/)?.[0].length ?? 1) as 1 | 2 | 3;
      const text = line.replace(/^#+\s+/, "").trim();
      nodes.push({
        type: "heading",
        attrs: { level: Math.min(level, 3) },
        content: text ? [{ type: "text", text }] : [],
      });
      continue;
    }

    if (isMarkdown && /^[-*]\s+/.test(line)) {
      nodes.push({
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: line.replace(/^[-*]\s+/, "") }],
              },
            ],
          },
        ],
      });
      continue;
    }

    if (line.trim() === "") {
      nodes.push({ type: "paragraph" });
      continue;
    }

    nodes.push({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    });
  }

  if (nodes.length === 0) {
    nodes.push({ type: "paragraph" });
  }

  return JSON.stringify({ type: "doc", content: nodes });
}
