import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border bg-card p-5 shadow-card", className)}>{children}</div>;
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
    <div className={cn("rounded-2xl p-5 text-on-color shadow-card", tones[tone])}>
      <div className="flex items-center justify-between text-sm font-medium opacity-80">
        {label}
        {icon}
      </div>
      <div className="mt-3 font-display text-3xl font-extrabold">{value}</div>
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
