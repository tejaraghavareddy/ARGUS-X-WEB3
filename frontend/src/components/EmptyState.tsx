import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-navy-900/15 bg-white px-6 py-14 text-center">
      <h3 className="font-display text-xl text-navy-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-navy-700/70">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
