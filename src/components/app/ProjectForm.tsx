import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { clientsQuery, type Project } from "@/lib/api";
import { DEFAULT_STATUS, PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Panel, nativeSelect } from "./ui-bits";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(150),
  client_id: z.string().uuid("Selecione um cliente"),
  description: z.string().trim().max(2000),
  type: z.string(),
  status: z.string(),
  value: z.coerce.number().min(0, "Valor inválido"),
  deadline: z.string(),
  links: z.string().trim().max(2000),
});

export function ProjectForm({ project }: { project?: Project }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const clients = useQuery(clientsQuery).data ?? [];
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    const row = { ...parsed.data, deadline: parsed.data.deadline || null };
    setSaving(true);
    const res = project
      ? await supabase.from("projects").update(row).eq("id", project.id).select().single()
      : await supabase.from("projects").insert(row).select().single();
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    await qc.invalidateQueries({ queryKey: ["projects"] });
    toast.success("Projeto salvo");
    navigate({ to: "/projetos/$id", params: { id: res.data.id } });
  }

  return (
    <Panel>
      <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={project?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente</Label>
          <select id="client_id" name="client_id" defaultValue={project?.client_id ?? ""} className={nativeSelect} required>
            <option value="" disabled>Selecione…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {!clients.length && <p className="text-xs text-muted-foreground">Cadastre um cliente primeiro.</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <select id="type" name="type" defaultValue={project?.type ?? "Website"} className={nativeSelect}>
            {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Valor (R$)</Label>
          <Input id="value" name="value" type="number" step="0.01" min="0" defaultValue={project?.value ?? 0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Prazo final</Label>
          <Input id="deadline" name="deadline" type="date" defaultValue={project?.deadline ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={project?.status ?? DEFAULT_STATUS} className={nativeSelect}>
            {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" name="description" rows={4} defaultValue={project?.description ?? ""} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="links">Links úteis (um por linha)</Label>
          <Textarea id="links" name="links" rows={3} defaultValue={project?.links ?? ""} placeholder="https://figma.com/…" />
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={saving}>Salvar</Button>
          <Button type="button" variant="secondary" onClick={() => history.back()}>Cancelar</Button>
        </div>
      </form>
    </Panel>
  );
}
