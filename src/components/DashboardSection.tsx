import { ReactNode } from "react";

export function DashboardSection({
  title,
  description,
  variant,
  children,
}: {
  title: string;
  description: string;
  variant: "owned" | "shared";
  children: ReactNode;
}) {
  const isOwned = variant === "owned";

  return (
    <section
      className={
        isOwned
          ? "rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/50 to-white p-5 sm:p-6"
          : "rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/70 to-white p-5 sm:p-6"
      }
    >
      <div className="mb-5 flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${
            isOwned ? "bg-brand-600" : "bg-violet-600"
          }`}
          aria-hidden
        >
          {isOwned ? "Me" : "RO"}
        </span>
        <div>
          <h2
            className={`text-lg font-semibold ${isOwned ? "text-brand-900" : "text-violet-950"}`}
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
