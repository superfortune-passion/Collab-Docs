export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-slate-200" />
      <div className="h-4 w-full max-w-md rounded bg-slate-100" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 rounded-xl bg-slate-100" />
        <div className="h-24 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
