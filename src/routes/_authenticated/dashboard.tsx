import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { CalendarClock, FolderKanban, Plus, Users, Activity, Calculator } from "lucide-react";
import { clientsQuery, projectsQuery } from "@/lib/api";
import { PROJECT_STATUSES, fmtDate } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Panel, StatCard, StatusBadge } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Freela Hub" }, { name: "description", content: "Resumo dos seus projetos e clientes." }] }),
  component: Dashboard,
});

const COLORS = ["var(--blue)", "var(--green)", "var(--yellow)", "var(--orange)", "var(--red)", "var(--muted-foreground)"];
const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" };

function Dashboard() {
  const projects = useQuery({ ...projectsQuery, refetchOnMount: "always" }).data ?? [];
  const clients = useQuery({ ...clientsQuery, refetchOnMount: "always" }).data ?? [];
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";

  const today = new Date().toISOString().slice(0, 10);
  const in14 = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
  const active = projects.filter((p) => p.status === "Em andamento");
  const upcoming = active.filter((p) => p.deadline && p.deadline >= today && p.deadline <= in14);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return d;
  });
  const lineData = months.map((d) => {
    const key = d.toISOString().slice(0, 7);
    return { mes: d.toLocaleDateString("pt-BR", { month: "short" }), projetos: projects.filter((p) => p.created_at.slice(0, 7) === key).length };
  });
  const barData = PROJECT_STATUSES.map((s) => ({ status: s, total: projects.filter((p) => p.status === s).length }));
  const typeMap = projects.reduce<Record<string, number>>((m, p) => ((m[p.type] = (m[p.type] ?? 0) + 1), m), {});
  const pieData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  const recent = [...projects].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do seu trabalho"
        actions={
          <>
            <Button asChild><Link to="/projetos/novo"><Plus /> Novo Projeto</Link></Button>
            <Button asChild variant="secondary"><Link to="/clientes/novo"><Plus /> Novo Cliente</Link></Button>
            <Button asChild variant="secondary"><Link to="/calculadora"><Calculator /> Calculadora</Link></Button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard tone="blue" label="Total de projetos" value={projects.length} icon={<FolderKanban className="size-5" />} />
        <StatCard tone="green" label="Projetos ativos" value={active.length} icon={<Activity className="size-5" />} />
        <StatCard tone="yellow" label="Total de clientes" value={clients.length} icon={<Users className="size-5" />} />
        <StatCard tone="red" label="Próximos prazos (14d)" value={upcoming.length} icon={<CalendarClock className="size-5" />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Evolução dos projetos</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="projetos" stroke="var(--blue)" strokeWidth={3} dot={{ r: 4, fill: "var(--blue)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-4 font-semibold">Distribuição por tipo</h2>
          <div className="h-64">
            {pieData.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty>Sem projetos ainda</Empty>}
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-4 font-semibold">Projetos por status</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={["var(--blue)", "var(--yellow)", "var(--green)", "var(--red)"][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="lg:col-span-2">
          <h2 className="mb-2 font-semibold">Projetos recentes</h2>
          {recent.length ? (
            <ul className="divide-y">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link to="/projetos/$id" params={{ id: p.id }} className="flex items-center justify-between gap-4 py-3 hover:opacity-80">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{clientName(p.client_id)} · prazo {fmtDate(p.deadline)}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : <Empty>Nenhum projeto cadastrado</Empty>}
        </Panel>
      </div>
    </>
  );
}
