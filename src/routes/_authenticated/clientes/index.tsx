import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { clientsQuery, projectsQuery } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, PageHeader, Panel } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/clientes/")({
  head: () => ({ meta: [{ title: "Clientes — Freela Hub" }, { name: "description", content: "Lista de clientes." }] }),
  component: ClientsList,
});

function ClientsList() {
  const qc = useQueryClient();
  const clients = useQuery(clientsQuery).data ?? [];
  const projects = useQuery(projectsQuery).data ?? [];
  const [search, setSearch] = useState("");
  const list = clients.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()));

  async function remove(id: string, name: string) {
    const { count } = await supabase.from("projects").select("id", { count: "exact", head: true }).eq("client_id", id);
    if ((count ?? 0) > 0 || projects.some((p) => p.client_id === id))
      { toast.error("Este cliente tem projetos vinculados e não pode ser excluído."); return; }
    if (!confirm(`Excluir o cliente "${name}"?`)) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) { toast.error("Não foi possível excluir: verifique projetos vinculados."); return; }
    toast.success("Cliente excluído");
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  return (
    <>
      <PageHeader title="Clientes" actions={<Button asChild><Link to="/clientes/novo"><Plus /> Novo Cliente</Link></Button>} />
      <Input className="mb-4 max-w-sm" placeholder="Buscar por nome…" value={search} onChange={(e) => setSearch(e.target.value)} />
      <Panel className="overflow-x-auto p-0">
        {list.length ? (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Telefone</th>
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.email || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.phone || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.company || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <Button asChild size="icon" variant="ghost" aria-label="Editar"><Link to="/clientes/$id/editar" params={{ id: c.id }}><Pencil /></Link></Button>
                    <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => remove(c.id, c.name)}><Trash2 /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <Empty>Nenhum cliente encontrado</Empty>}
      </Panel>
    </>
  );
}
