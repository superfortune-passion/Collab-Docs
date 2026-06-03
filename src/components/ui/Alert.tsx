export function Alert({
  variant = "error",
  children,
}: {
  variant?: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "bg-red-50 text-red-800 border-red-100",
    success: "bg-emerald-50 text-emerald-800 border-emerald-100",
    info: "bg-blue-50 text-blue-800 border-blue-100",
  };
  const roles = {
    error: "alert",
    success: "status",
    info: "status",
  } as const;

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}
      role={roles[variant]}
      aria-live="polite"
    >
      {children}
    </div>
  );
}
