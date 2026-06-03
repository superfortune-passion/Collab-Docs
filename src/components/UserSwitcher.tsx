"use client";

import { useTransition } from "react";
import { switchUser } from "@/actions/session";

type User = { id: string; name: string; email: string };

export function UserSwitcher({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="user-switcher" className="text-sm font-medium text-slate-600">
        Viewing as
      </label>
      <select
        id="user-switcher"
        disabled={pending}
        value={currentUserId ?? ""}
        onChange={(e) => {
          const id = e.target.value;
          if (!id) return;
          startTransition(() => {
            void switchUser(id);
          });
        }}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
      >
        <option value="" disabled>
          Select user…
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
