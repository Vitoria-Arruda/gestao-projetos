import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { clientsQuery, projectQuery, stepsQuery, type Step } from "@/lib/api";
import { brl, fmtDate } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Empty, PageHeader, Panel, StatusBadge } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/projetos/$id")({
  head: () => ({ meta: [{ title: "Detalhes do projeto — Freela Hub" }, { name: "description", content: "Etapas, notas e links do projeto." }] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const project = useQuery(projectQuery(id)).data;
  const steps = useQuery(stepsQuery(id)).data ?? [];
  const clients = useQuery(clientsQuery).data ?? [];
  const [notes, setNotes] = useState("");
  const [newStep, setNewStep] = useState("");
  useEffect(() => setNotes(project?.notes ?? ""), [project?.notes]);

  if (!project) return null;
  const done = steps.filter((s) => s.done).length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
  const links = (project.links ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const refreshSteps = () => qc.invalidateQueries({ queryKey: ["steps", id] });

  async function saveNotes() {
    const { error } = await supabase.from("projects").update({ notes }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Notas salvas");
    qc.invalidateQueries({ queryKey: ["projects"] });
  }
  async function addStep(e: React.FormEvent) {
    e.preventDefault();
    const title = newStep.trim().slice(0, 200);
    if (!title) return;
    const { error } = await supabase.from("project_steps").insert({ project_id: id, title, position: steps.length });
    if (error) { toast.error(error.message); return; }
    setNewStep("");
    refreshSteps();
  }

  return (
    <>
      <PageHeader
        title={project.name}
        actions={<Button asChild variant="secondary"><Link to="/projetos/$id/editar" params={{ id }}><Pencil /> Editar</Link></Button>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="space-y-4">
          <StatusBadge status={project.status} />
          <Info label="Cliente" value={clients.find((c) => c.id === project.client_id)?.name ?? "—"} />
          <Info label="Tipo" value={project.type} />
          <Info label="Valor" value={brl(Number(project.value))} />
          <Info label="Prazo final" value={fmtDate(project.deadline)} />
          {project.description && <Info label="Descrição" value={project.description} />}
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Links úteis</p>
            {links.length ? (
              <ul className="space-y-1">
                {links.map((l) => (
                  <li key={l}>
                    <a href={/^https?:\/\//.test(l) ? l : `https://${l}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-sm text-primary hover:underline">
                      <ExternalLink className="size-3 shrink-0" /> {l}
                    </a>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">Nenhum link</p>}
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Etapas</h2>
            <span className="text-sm text-muted-foreground">{done}/{steps.length} · {pct}%</span>
          </div>
          <Progress value={pct} className="mb-5 h-2" />
          {steps.length ? (
            <ul className="divide-y">{steps.map((s) => <StepRow key={s.id} step={s} onChange={refreshSteps} />)}</ul>
          ) : <Empty>Adicione a primeira etapa</Empty>}
          <form onSubmit={addStep} className="mt-4 flex gap-2">
            <Input placeholder="Nova etapa…" value={newStep} onChange={(e) => setNewStep(e.target.value)} />
            <Button type="submit"><Plus /> Adicionar</Button>
          </form>
        </Panel>

        <Panel className="lg:col-span-3">
          <h2 className="mb-3 font-semibold">Notas gerais</h2>
          <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 5000))} placeholder="Anotações sobre o projeto…" />
          <Button className="mt-3" onClick={saveNotes}>Salvar notas</Button>
        </Panel>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-line text-sm">{value}</p>
    </div>
  );
}

function StepRow({ step, onChange }: { step: Step; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(step.title);
  const run = async (p: PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await p;
    if (error) toast.error(error.message);
    onChange();
  };
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Checkbox checked={step.done} onCheckedChange={(v) => run(supabase.from("project_steps").update({ done: !!v }).eq("id", step.id))} />
      {editing ? (
        <>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8" autoFocus />
          <Button size="icon" variant="ghost" aria-label="Salvar" onClick={() => { setEditing(false); run(supabase.from("project_steps").update({ title: title.trim().slice(0, 200) || step.title }).eq("id", step.id)); }}><Check /></Button>
          <Button size="icon" variant="ghost" aria-label="Cancelar" onClick={() => { setTitle(step.title); setEditing(false); }}><X /></Button>
        </>
      ) : (
        <>
          <span className={step.done ? "flex-1 text-sm text-muted-foreground line-through" : "flex-1 text-sm"}>{step.title}</span>
          <Button size="icon" variant="ghost" aria-label="Editar etapa" onClick={() => setEditing(true)}><Pencil /></Button>
          <Button size="icon" variant="ghost" aria-label="Excluir etapa" onClick={() => run(supabase.from("project_steps").delete().eq("id", step.id))}><Trash2 /></Button>
        </>
      )}
    </li>
  );
}
