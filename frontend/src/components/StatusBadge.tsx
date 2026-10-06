interface StatusBadgeProps {
  status: "verified" | "revoked" | "pending" | "active";
  label?: string;
}

const styles: Record<StatusBadgeProps["status"], string> = {
  verified: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  active: "bg-sky-50 text-sky-800 ring-sky-200",
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  revoked: "bg-rose-50 text-rose-800 ring-rose-200",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status]}`}
    >
      {label ?? status}
    </span>
  );
}
