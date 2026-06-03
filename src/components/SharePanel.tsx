"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { shareDocument } from "@/actions/documents";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type User = { id: string; name: string };

export function SharePanel({
  documentId,
  ownerId,
  currentUserId,
  sharedUsers,
  allUsers,
}: {
  documentId: string;
  ownerId: string;
  currentUserId: string;
  sharedUsers: User[];
  allUsers: User[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    null
  );

  const candidates = allUsers.filter(
    (u) => u.id !== ownerId && u.id !== currentUserId && !sharedUsers.some((s) => s.id === u.id)
  );

  function handleShare(userId: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await shareDocument(documentId, userId);
      if (result.success) {
        setMessage({ type: "success", text: "Document shared successfully." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <h3 className="text-sm font-semibold text-slate-800">Sharing</h3>
      {sharedUsers.length > 0 ? (
        <p className="mt-2 text-sm text-slate-600">
          Shared with:{" "}
          <span className="font-medium">{sharedUsers.map((u) => u.name).join(", ")}</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Not shared with anyone yet.</p>
      )}

      {candidates.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {candidates.map((u) => (
            <Button
              key={u.id}
              variant="secondary"
              disabled={pending}
              onClick={() => handleShare(u.id)}
              className="text-xs"
            >
              Share with {u.name}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">All other users already have access.</p>
      )}

      {message && (
        <div className="mt-3">
          <Alert variant={message.type === "success" ? "success" : "error"}>
            {message.text}
          </Alert>
        </div>
      )}
    </div>
  );
}
