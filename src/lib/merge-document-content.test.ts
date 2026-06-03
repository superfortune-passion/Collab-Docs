import { describe, it, expect } from "vitest";
import { mergeDocumentContent } from "./merge-document-content";

describe("mergeDocumentContent", () => {
  it("appends imported nodes after existing content", () => {
    const existing = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
    });
    const imported = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "World" }] }],
    });
    const merged = JSON.parse(mergeDocumentContent(existing, imported));
    expect(merged.content).toHaveLength(3);
    expect(merged.content[0].content[0].text).toBe("Hello");
    expect(merged.content[1].type).toBe("horizontalRule");
    expect(merged.content[2].content[0].text).toBe("World");
  });
});
