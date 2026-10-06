import { X } from "lucide-react";
import { useToast } from "../hooks/useToast";

export function ToastStack() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border bg-white p-4 shadow-card ${
            toast.type === "error"
              ? "border-rose-200"
              : toast.type === "success"
                ? "border-emerald-200"
                : "border-navy-900/10"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-navy-900">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm text-navy-700/80">{toast.description}</p>
              ) : null}
            </div>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
