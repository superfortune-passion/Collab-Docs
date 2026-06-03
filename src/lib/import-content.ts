import { generateJSON } from "@tiptap/html";
import { tiptapImportExtensions } from "@/lib/tiptap-import-extensions";
import { parseImportToDocContent, type ImportFileKind } from "@/lib/validations";

export async function fileToTiptapContent(
  buffer: ArrayBuffer,
  filename: string,
  kind: ImportFileKind
): Promise<string> {
  if (kind === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.convertToHtml({
      buffer: Buffer.from(buffer),
    });
    const html = result.value?.trim() || "<p></p>";
    const json = generateJSON(html, tiptapImportExtensions);
    return JSON.stringify(json);
  }

  const raw = new TextDecoder().decode(buffer);
  return parseImportToDocContent(raw, kind === "md");
}
