"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createDocument } from "@/actions/documents";
import { Button } from "@/components/ui/Button";
import { ImportButton } from "@/components/ImportButton";
import { Alert } from "@/components/ui/Alert";

export function DashboardActions({ hasUser }: { hasUser: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createDocument();
      if (result.success && result.data) {
        router.push(`/documents/${result.data.id}`);
        router.refresh();
      } else {
        setError(result.success ? null : result.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={handleCreate} disabled={!hasUser || pending}>
        {pending ? "Creating…" : "New document"}
      </Button>
      <ImportButton disabled={!hasUser} />
      {error && (
        <div className="w-full">
          <Alert>{error}</Alert>
        </div>
      )}
    </div>
  );
}
