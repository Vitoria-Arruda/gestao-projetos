export const PROJECT_STATUSES = ["Em andamento", "Pausado", "Concluído", "Cancelado"] as const;
export const DEFAULT_STATUS = "Em andamento";
export const PROJECT_TYPES = ["Website", "Design", "App", "Marketing", "Consultoria", "Outro"] as const;

export type ProjectLike = {
  name: string;
  client_id: string;
  status: string;
  deadline: string | null;
};

export type ProjectFilters = { clientId?: string; status?: string; search?: string };

/** Combined filters (client + status + search), sorted by deadline ascending (no deadline last). */
export function filterProjects<T extends ProjectLike>(list: T[], f: ProjectFilters): T[] {
  const q = (f.search ?? "").trim().toLowerCase();
  return list
    .filter((p) => !f.clientId || p.client_id === f.clientId)
    .filter((p) => !f.status || p.status === f.status)
    .filter((p) => !q || p.name.toLowerCase().includes(q))
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });
}

export type PricingInput = {
  hourlyRate: number;
  hours: number;
  complexity: number;
  extraCosts: number;
  margin: number;
};

/** price = (rate × hours × complexity + extra costs) × (1 + margin%) */
export function calculatePrice(i: PricingInput) {
  const labor = i.hourlyRate * i.hours * i.complexity;
  const subtotal = labor + i.extraCosts;
  const marginValue = subtotal * (i.margin / 100);
  return { labor, subtotal, marginValue, total: subtotal + marginValue };
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDate = (d: string | null) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";
