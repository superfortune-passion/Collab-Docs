import { getDashboardData } from "@/actions/documents";
import { DashboardActions } from "@/components/DashboardActions";
import { DocumentCard } from "@/components/DocumentCard";
import { DashboardSection } from "@/components/DashboardSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCardPermissions } from "@/lib/document-access";
import { getCurrentUserId } from "@/lib/session";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  const { user, owned, shared } = await getDashboardData(userId);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {user ? `${user.name}'s workspace` : "Document workspace"}
          </h1>
          <p className="mt-2 text-slate-600">
            Create, edit, and share rich-text documents. Switch users to demo ownership and
            sharing.
          </p>
        </div>
        <DashboardActions hasUser={!!user} />
      </section>

      {!user && (
        <EmptyState
          title="Select a user to get started"
          description="Use the switcher in the header to view as Alice or Bob. No passwords — this demo uses mock users only."
        />
      )}

      {user && (
        <>
          <DashboardSection
            title="My Documents"
            description="Documents you own — edit, share, delete, and import."
            variant="owned"
          >
            {owned.length === 0 ? (
              <EmptyState
                title="No documents yet"
                description="Create a new document or import a .txt, .md, or .docx file to get started."
              />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {owned.map((doc) => (
                  <li key={doc.id}>
                    <DocumentCard
                      variant="owned"
                      doc={doc}
                      permissions={getCardPermissions(doc, userId)}
                      badge={
                        doc.shares.length > 0
                          ? `Shared (${doc.shares.length})`
                          : "Owner"
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </DashboardSection>

          <DashboardSection
            title="Shared With Me"
            description="Documents others shared with you — view only, no editing."
            variant="shared"
          >
            {shared.length === 0 ? (
              <EmptyState
                title="Nothing shared with you"
                description="When another user shares a document with you, it will appear here."
              />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {shared.map((doc) => (
                  <li key={doc.id}>
                    <DocumentCard
                      variant="shared"
                      doc={doc}
                      permissions={getCardPermissions(doc, userId)}
                      badge="View only"
                    />
                  </li>
                ))}
              </ul>
            )}
          </DashboardSection>
        </>
      )}
    </div>
  );
}
