export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border border-b-2 bg-surface px-1.5 py-px font-mono text-[0.8em] font-medium">
      {children}
    </kbd>
  );
}
