import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { clientsQuery, projectsQuery } from "@/lib/api";
import { PROJECT_STATUSES, filterProjects, fmtDate } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, PageHeader, Panel, StatusBadge, nativeSelect } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/projetos/")({
  head: () => ({ meta: [{ title: "Projetos — Freela Hub" }, { name: "description", content: "Lista de projetos com filtros." }] }),
  component: ProjectsList,
});

function ProjectsList() {
  const qc = useQueryClient();
  const projects = useQuery(projectsQuery).data ?? [];
  const clients = useQuery(clientsQuery).data ?? [];
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const list = filterProjects(projects, { clientId, status, search });
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir o projeto "${name}"?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Projeto excluído");
    qc.invalidateQueries({ queryKey: ["projects"] });
  }

  return (
    <>
      <PageHeader title="Projetos" actions={<Button asChild><Link to="/projetos/novo"><Plus /> Novo Projeto</Link></Button>} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input placeholder="Buscar por nome…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={nativeSelect} value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Todos os clientes</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className={nativeSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <Panel className="overflow-x-auto p-0">
        {list.length ? (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="px-5 py-3 font-medium">Projeto</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Prazo</th>
                <th className="px-5 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="px-5 py-3 font-medium"><Link to="/projetos/$id" params={{ id: p.id }} className="hover:text-primary">{p.name}</Link></td>
                  <td className="px-5 py-3 text-muted-foreground">{clientName(p.client_id)}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{fmtDate(p.deadline)}</td>
                  <td className="px-5 py-3 text-right">
                    <Button asChild size="icon" variant="ghost" aria-label="Editar"><Link to="/projetos/$id/editar" params={{ id: p.id }}><Pencil /></Link></Button>
                    <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => remove(p.id, p.name)}><Trash2 /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <Empty>Nenhum projeto encontrado</Empty>}
      </Panel>
    </>
  );
}
