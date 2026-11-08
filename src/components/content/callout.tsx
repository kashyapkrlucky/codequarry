import { Info, Lightbulb, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";
import type { CalloutType } from "@/lib/content/policy";
import { cn } from "@/lib/utils";

const STYLES: Record<CalloutType, { icon: LucideIcon; label: string; className: string; iconClass: string }> = {
  info: { icon: Info, label: "Note", className: "border-brand-2/30 bg-brand-2/[0.06]", iconClass: "text-brand-2" },
  tip: { icon: Lightbulb, label: "Tip", className: "border-success/30 bg-success/[0.06]", iconClass: "text-success" },
  warning: { icon: TriangleAlert, label: "Warning", className: "border-warning/35 bg-warning/[0.07]", iconClass: "text-warning" },
  danger: { icon: OctagonAlert, label: "Danger", className: "border-destructive/35 bg-destructive/[0.07]", iconClass: "text-destructive" },
};

export function Callout({ type = "info", title, children }: { type?: CalloutType; title?: string; children: React.ReactNode }) {
  const style = STYLES[type] ?? STYLES.info;
  const Icon = style.icon;
  return (
    <aside role="note" aria-label={title ?? style.label} className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", style.className)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", style.iconClass)} aria-hidden="true" />
      <div className="min-w-0 space-y-1.5 [&>p]:m-0 [&>p]:text-foreground/90">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </aside>
  );
}
