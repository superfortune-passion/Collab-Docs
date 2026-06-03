"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Link from "next/link";
import { renameDocument, saveDocument } from "@/actions/documents";
import { EditorToolbar } from "@/components/EditorToolbar";
import { SharePanel } from "@/components/SharePanel";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ImportButton, type ImportResult } from "@/components/ImportButton";

type User = { id: string; name: string };

export function DocumentEditor({
  documentId,
  initialTitle,
  initialContent,
  access,
  owner,
  sharedUsers,
  allUsers,
  currentUserId,
}: {
  documentId: string;
  initialTitle: string;
  initialContent: string;
  access: "owner" | "shared";
  owner: User;
  sharedUsers: User[];
  allUsers: User[];
  currentUserId: string;
}) {
  const isReadOnly = access === "shared";
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusNotice, setStatusNotice] = useState<{
    variant: "error" | "success" | "info";
    text: string;
  } | null>(null);
  const [renamePending, startRename] = useTransition();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(initialContent);

  const showNotice = useCallback((variant: "error" | "success" | "info", text: string) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setStatusNotice({ variant, text });
    if (variant === "success" || variant === "info") {
      noticeTimer.current = setTimeout(() => setStatusNotice(null), 5000);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !isReadOnly,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: safeParseJson(initialContent),
    editorProps: {
      attributes: {
        class: `prose prose-slate max-w-none px-6 py-4 focus:outline-none min-h-[320px] ${
          isReadOnly ? "cursor-default select-text" : ""
        }`,
        "data-placeholder": isReadOnly ? "" : "Start writing…",
      },
    },
    onUpdate: isReadOnly
      ? undefined
      : ({ editor: ed }) => {
          scheduleSave(JSON.stringify(ed.getJSON()));
        },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly);
    }
  }, [editor, isReadOnly]);

  const persistContent = useCallback(
    async (json: string, options?: { manual?: boolean }) => {
      if (isReadOnly) return;
      if (json === lastSaved.current) {
        if (options?.manual) {
          setSaveStatus("saved");
          showNotice("success", "All changes are already saved.");
        }
        return;
      }
      setSaveStatus("saving");
      const result = await saveDocument(documentId, json);
      if (result.success) {
        lastSaved.current = json;
        setSaveStatus("saved");
        if (options?.manual) {
          showNotice("success", "Document saved.");
        } else {
          setStatusNotice(null);
        }
      } else {
        setSaveStatus("error");
        showNotice("error", result.error);
      }
    },
    [documentId, showNotice, isReadOnly]
  );

  function scheduleSave(json: string) {
    if (isReadOnly) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistContent(json), 800);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function handleManualSave() {
    if (isReadOnly) return;
    if (!editor) {
      showNotice("error", "Editor is still loading. Please try again.");
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const json = JSON.stringify(editor.getJSON());
    await persistContent(json, { manual: true });
  }

  function handleTitleBlur() {
    if (isReadOnly) return;
    const trimmed = title.trim();
    if (!trimmed || trimmed === initialTitle) return;
    startRename(async () => {
      const result = await renameDocument(documentId, trimmed);
      if (!result.success) {
        showNotice("error", result.error);
        setTitle(initialTitle);
      }
    });
  }

  function applyImportedContent(result: ImportResult) {
    if (isReadOnly || !result.content || !editor) return;
    try {
      const parsed = JSON.parse(result.content) as object;
      editor.commands.setContent(parsed);
      lastSaved.current = result.content;
      setSaveStatus("saved");
      showNotice(
        "success",
        result.mode === "attach"
          ? "File attached to the end of this document."
          : "Document content replaced from file."
      );
    } catch {
      showNotice("error", "Imported but failed to refresh the editor. Reload the page.");
    }
  }

  return (
    <div className="space-y-4">
      {isReadOnly && (
        <Alert variant="info">
          <strong>View only</strong> — This document belongs to {owner.name}. You cannot edit,
          save, or import into it.
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← Dashboard
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span
            className={
              isReadOnly
                ? "rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800"
                : ""
            }
          >
            {isReadOnly ? `View only · Shared by ${owner.name}` : "You own this document"}
          </span>
          {!isReadOnly && (
            <>
              <span className="hidden sm:inline">·</span>
              <span
                className={
                  saveStatus === "error"
                    ? "text-red-600"
                    : saveStatus === "saving"
                      ? "text-amber-600"
                      : saveStatus === "saved"
                        ? "text-emerald-600"
                        : "text-slate-400"
                }
              >
                {saveStatus === "saving"
                  ? "Saving…"
                  : saveStatus === "saved"
                    ? "All changes saved"
                    : saveStatus === "error"
                      ? "Save failed"
                      : "Auto-save on"}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={!editor || saveStatus === "saving"}
                onClick={() => void handleManualSave()}
                className="py-1.5 px-3 text-xs"
              >
                {saveStatus === "saving" ? "Saving…" : "Save now"}
              </Button>
              <ImportButton
                documentId={documentId}
                mode="attach"
                label="Attach file"
                compact
                onImported={applyImportedContent}
              />
              <ImportButton
                documentId={documentId}
                mode="replace"
                label="Replace from file"
                compact
                onImported={applyImportedContent}
              />
            </>
          )}
        </div>
      </div>

      {statusNotice && (
        <Alert variant={statusNotice.variant}>
          <div className="flex items-start justify-between gap-3">
            <span>{statusNotice.text}</span>
            <button
              type="button"
              className="shrink-0 text-xs font-medium opacity-70 hover:opacity-100"
              onClick={() => setStatusNotice(null)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </Alert>
      )}

      {isReadOnly ? (
        <h1 className="px-1 text-2xl font-bold text-violet-950">{title}</h1>
      ) : (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          disabled={renamePending}
          className="w-full rounded-lg border border-transparent bg-transparent px-1 text-2xl font-bold text-slate-900 focus:border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          aria-label="Document title"
        />
      )}

      <div
        className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
          isReadOnly ? "border-violet-200 ring-1 ring-violet-100" : "border-slate-200"
        }`}
      >
        {!isReadOnly && <EditorToolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>

      {access === "owner" && currentUserId && (
        <SharePanel
          documentId={documentId}
          ownerId={owner.id}
          currentUserId={currentUserId}
          sharedUsers={sharedUsers}
          allUsers={allUsers}
        />
      )}
    </div>
  );
}

function safeParseJson(raw: string): object {
  try {
    return JSON.parse(raw) as object;
  } catch {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
}
