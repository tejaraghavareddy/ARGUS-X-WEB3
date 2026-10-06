export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-navy-700">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-navy-200 border-t-navy-800" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
