import { describe, it, expect } from "vitest";
import {
  getImportFileKind,
  validateImportFilename,
  getMaxImportBytes,
} from "./validations";

describe("import file validation", () => {
  it("accepts txt, md, and docx", () => {
    expect(validateImportFilename("notes.txt")).toBe(true);
    expect(validateImportFilename("README.MD")).toBe(true);
    expect(validateImportFilename("report.docx")).toBe(true);
    expect(validateImportFilename("file.pdf")).toBe(false);
  });

  it("returns correct kind and size limits", () => {
    expect(getImportFileKind("a.docx")).toBe("docx");
    expect(getMaxImportBytes("docx")).toBe(5_000_000);
    expect(getMaxImportBytes("txt")).toBe(500_000);
  });
});
