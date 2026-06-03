"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { ImportMode } from "@/lib/validations";

const ACCEPT = ".txt,.md,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type ImportResult = {
  id: string;
  title?: string;
  content?: string;
  mode: ImportMode;
};

export function ImportButton({
  disabled,
  documentId,
  mode = "new",
  label,
  compact = false,
  onImported,
}: {
  disabled?: boolean;
  documentId?: string;
  mode?: ImportMode;
  label?: string;
  compact?: boolean;
  onImported?: (result: ImportResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const defaultLabel =
    mode === "new"
      ? "Import file"
      : mode === "attach"
        ? "Attach file"
        : "Replace with file";

  async function uploadFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
      if (documentId) formData.append("documentId", documentId);

      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed");
        return;
      }

      const result: ImportResult = {
        id: data.id,
        title: data.title,
        content: data.content,
        mode: data.mode ?? mode,
      };

      if (onImported) {
        onImported(result);
      } else if (mode === "new") {
        router.push(`/documents/${result.id}`);
      }
      router.refresh();
    } catch {
      setError("Network error during import.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
      setPendingFile(null);
    }
  }

  function handleFileSelected(file: File) {
    if (mode === "replace") {
      setPendingFile(file);
      setReplaceConfirmOpen(true);
      return;
    }
    void uploadFile(file);
  }

  return (
    <div className={compact ? "inline-flex flex-col gap-1" : "flex flex-col items-end gap-2"}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        className="!hidden sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
        }}
      />
      <Button
        type="button"
        variant={mode === "replace" ? "ghost" : "secondary"}
        disabled={disabled || loading}
        onClick={() => inputRef.current?.click()}
        className={compact ? "py-1.5 px-3 text-xs" : undefined}
      >
        {loading ? "Importing…" : (label ?? defaultLabel)}
      </Button>
      {error && (
        <div className={compact ? "absolute z-10 mt-8" : "max-w-xs"}>
          <Alert>{error}</Alert>
        </div>
      )}

      <ConfirmDialog
        open={replaceConfirmOpen}
        title="Replace all content?"
        description={
          <>
            The current document body will be replaced by the imported file. This cannot be
            undone with Undo — use Save and version backups in a full product.
          </>
        }
        confirmLabel="Replace content"
        loading={loading}
        onCancel={() => {
          if (!loading) {
            setReplaceConfirmOpen(false);
            setPendingFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }
        }}
        onConfirm={() => {
          if (pendingFile) void uploadFile(pendingFile);
          setReplaceConfirmOpen(false);
        }}
      />
    </div>
  );
}
