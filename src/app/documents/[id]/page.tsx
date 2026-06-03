import Link from "next/link";
import { getDocumentPageData } from "@/actions/documents";
import { DocumentEditor } from "@/components/DocumentEditor";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentUserId } from "@/lib/session";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const { doc, access, allUsers } = await getDocumentPageData(id, userId);

  if (!userId) {
    return (
      <EmptyState
        title="Select a user"
        description="Choose Alice or Bob from the header to open documents."
        action={
          <Link href="/" className="text-sm font-medium text-brand-600 hover:underline">
            Back to dashboard
          </Link>
        }
      />
    );
  }

  if (!doc) {
    return (
      <EmptyState
        title="Document not found"
        description="This document does not exist or you do not have access."
        action={
          <Link href="/" className="text-sm font-medium text-brand-600 hover:underline">
            Back to dashboard
          </Link>
        }
      />
    );
  }

  return (
    <DocumentEditor
      documentId={doc.id}
      initialTitle={doc.title}
      initialContent={doc.content}
      access={access}
      owner={doc.owner}
      sharedUsers={doc.shares.map((s) => s.user)}
      allUsers={allUsers}
      currentUserId={userId}
    />
  );
}
