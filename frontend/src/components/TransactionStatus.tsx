import type { MintProgress } from "../types";

const steps: { key: MintProgress; label: string }[] = [
  { key: "preparing", label: "Preparing certificate..." },
  { key: "uploading", label: "Uploading metadata to IPFS..." },
  { key: "awaiting-wallet", label: "Waiting for wallet confirmation..." },
  { key: "confirming", label: "Confirming blockchain transaction..." },
  { key: "success", label: "Certificate issued successfully." },
];

const order: MintProgress[] = steps.map((step) => step.key);

export function TransactionStatus({
  progress,
  error,
}: {
  progress: MintProgress;
  error?: string | null;
}) {
  if (progress === "idle") return null;
  const currentIndex = order.indexOf(progress === "error" ? "confirming" : progress);

  return (
    <div className="rounded-2xl border border-navy-900/10 bg-white p-5">
      <ol className="space-y-3">
        {steps.map((step, index) => {
          const done = currentIndex > index || progress === "success";
          const active = currentIndex === index && progress !== "success" && progress !== "error";
          return (
            <li key={step.key} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-emerald-600 text-white"
                    : active
                      ? "bg-navy-900 text-white"
                      : "bg-navy-100 text-navy-500"
                }`}
              >
                {index + 1}
              </span>
              <span className={done || active ? "font-medium text-navy-900" : "text-navy-500"}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      {progress === "error" && error ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}
    </div>
  );
}
