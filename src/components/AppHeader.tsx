import Link from "next/link";
import { UserSwitcher } from "@/components/UserSwitcher";

type User = { id: string; name: string; email: string };

export function AppHeader({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string | null;
}) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            CD
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900 leading-tight">Collab Docs</p>
            <p className="text-xs text-slate-500">Lightweight shared editor</p>
          </div>
        </Link>
        <UserSwitcher users={users} currentUserId={currentUserId} />
      </div>
    </header>
  );
}
