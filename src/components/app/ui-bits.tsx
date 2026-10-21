import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="col-span-2 grid min-w-0 grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-wrap">{actions}</div>}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("min-w-0 rounded-2xl border bg-card p-5 shadow-card", className)}>{children}</div>;
}

const tones = {
  red: "bg-red",
  yellow: "bg-yellow",
  green: "bg-green",
  blue: "bg-blue",
  orange: "bg-orange",
} as const;
export type Tone = keyof typeof tones;

export function StatCard({ tone, label, value, icon }: { tone: Tone; label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className={cn("min-w-0 rounded-2xl p-5 text-on-color shadow-card", tones[tone])}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-sm font-medium opacity-80">
        <span className="min-w-0 break-words">{label}</span>
        <span className="shrink-0">{icon}</span>
      </div>
      <div className="mt-3 min-w-0 font-display text-3xl leading-tight font-extrabold [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
}

const statusTone: Record<string, string> = {
  "Em andamento": "bg-blue/20 text-blue",
  Pausado: "bg-yellow/20 text-yellow",
  Concluído: "bg-green/20 text-green",
  Cancelado: "bg-red/20 text-red",
};
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusTone[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{children}</p>;
}

export const nativeSelect =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&>option]:bg-card";
