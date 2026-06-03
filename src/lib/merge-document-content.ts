type TiptapDoc = { type: "doc"; content?: object[] };

function parseDoc(json: string): TiptapDoc {
  try {
    const parsed = JSON.parse(json) as TiptapDoc;
    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      return parsed;
    }
  } catch {
    /* fall through */
  }
  return { type: "doc", content: [{ type: "paragraph" }] };
}

/** Appends imported blocks after existing document content with a visual separator. */
export function mergeDocumentContent(existingJson: string, importedJson: string): string {
  const existing = parseDoc(existingJson);
  const imported = parseDoc(importedJson);
  const separator = {
    type: "horizontalRule",
  };
  const content = [
    ...(existing.content ?? []),
    separator,
    ...(imported.content ?? []),
  ];
  return JSON.stringify({ type: "doc", content });
}

export function replaceDocumentContent(importedJson: string): string {
  return JSON.stringify(parseDoc(importedJson));
}
