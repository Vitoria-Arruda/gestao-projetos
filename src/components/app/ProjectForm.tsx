import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { clientsQuery, type Project } from "@/lib/api";
import { DEFAULT_STATUS, formatValueInput, maskPhone, parseValueInput, PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Panel, nativeSelect } from "./ui-bits";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(150),
  client_id: z.string().optional(),
  description: z.string().trim().max(2000),
  type: z.string(),
  status: z.string(),
  value: z.string(),
  deadline: z.string(),
  links: z.string().trim().max(2000),
  notes: z.string().trim().max(5000),
});

const newClientSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do cliente").max(120),
  email: z.union([z.literal(""), z.string().trim().email("Email do cliente inválido").max(255)]),
  phone: z.string().trim().max(40),
});

export function ProjectForm({ project }: { project?: Project }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const clients = useQuery(clientsQuery).data ?? [];
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"new" | "existing">(project ? "existing" : "new");
  const [valueDisplay, setValueDisplay] = useState(() => formatValueInput(String(project?.value ?? "")));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(fd);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos"); return; }
    let clientId = parsed.data.client_id ?? "";
    setSaving(true);
    if (mode === "new") {
      const c = newClientSchema.safeParse({ name: fd["client_name"], email: fd["client_email"] ?? "", phone: fd["client_phone"] ?? "" });
      if (!c.success) { setSaving(false); toast.error(c.error.issues[0]?.message ?? "Cliente inválido"); return; }
      const cr = await supabase.from("clients").insert(c.data).select().single();
      if (cr.error) { setSaving(false); toast.error(cr.error.message); return; }
      clientId = cr.data.id;
      await qc.invalidateQueries({ queryKey: ["clients"] });
    } else if (!clientId) { setSaving(false); toast.error("Selecione um cliente"); return; }
    const row = { ...parsed.data, client_id: clientId, deadline: parsed.data.deadline || null, value: parseValueInput(parsed.data.value) };
    const res = project
      ? await supabase.from("projects").update(row).eq("id", project.id).select().single()
      : await supabase.from("projects").insert(row).select().single();
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
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
        <div className="space-y-3 rounded-xl border p-4 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Cliente</Label>
            <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
              <button type="button" onClick={() => setMode("new")} className={`rounded-md px-3 py-1 ${mode === "new" ? "bg-card font-medium" : "text-muted-foreground"}`}>Novo cliente</button>
              <button type="button" onClick={() => setMode("existing")} disabled={!clients.length} className={`rounded-md px-3 py-1 disabled:opacity-50 ${mode === "existing" ? "bg-card font-medium" : "text-muted-foreground"}`}>Cliente existente</button>
            </div>
          </div>
          {mode === "existing" ? (
            <select id="client_id" name="client_id" defaultValue={project?.client_id ?? ""} className={nativeSelect} required>
              <option value="" disabled>Selecione…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              <Input name="client_name" placeholder="Nome do cliente" required />
              <Input name="client_email" type="email" placeholder="Email (opcional)" />
              <Input name="client_phone" type="tel" placeholder="Telefone (opcional)" onInput={(e) => { e.currentTarget.value = maskPhone(e.currentTarget.value); }} />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <select id="type" name="type" defaultValue={project?.type ?? "Website"} className={nativeSelect}>
            {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Valor (R$)</Label>
          <Input id="value" name="value" inputMode="decimal" placeholder="0,00" value={valueDisplay} onChange={(e) => setValueDisplay(formatValueInput(e.target.value))} />
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
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" rows={4} defaultValue={project?.notes ?? ""} />
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={saving}>Salvar</Button>
          <Button type="button" variant="secondary" onClick={() => history.back()}>Cancelar</Button>
        </div>
      </form>
    </Panel>
  );
}
