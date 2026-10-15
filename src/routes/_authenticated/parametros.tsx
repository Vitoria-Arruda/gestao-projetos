import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel, nativeSelect } from "@/components/app/ui-bits";
import { COMPLEXITIES } from "./calculadora";

export const Route = createFileRoute("/_authenticated/parametros")({
  head: () => ({ meta: [{ title: "Parâmetros — Freela Hub" }, { name: "description", content: "Valores padrão de precificação." }] }),
  component: Params,
});

const schema = z.object({
  hourly_rate: z.coerce.number().min(0).max(100000),
  margin: z.coerce.number().min(0).max(1000),
  complexity: z.coerce.number().min(0.1).max(5),
});

function Params() {
  const qc = useQueryClient();
  const { data: s } = useQuery(settingsQuery);
  const { user } = Route.useRouteContext();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return toast.error("Valores inválidos");
    const { error } = await supabase.from("pricing_settings").upsert({ user_id: user.id, ...parsed.data, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success("Parâmetros salvos");
    qc.invalidateQueries({ queryKey: ["settings"] });
  }

  if (!s) return null;
  return (
    <>
      <PageHeader title="Parâmetros" subtitle="Usados como padrão na calculadora" />
      <Panel className="max-w-xl">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="hr">Valor/hora padrão (R$)</Label><Input id="hr" name="hourly_rate" type="number" step="0.01" min="0" defaultValue={s.hourly_rate} /></div>
          <div className="space-y-2"><Label htmlFor="mg">Margem padrão (%)</Label><Input id="mg" name="margin" type="number" step="0.1" min="0" defaultValue={s.margin} /></div>
          <div className="space-y-2">
            <Label htmlFor="cx">Complexidade padrão</Label>
            <select id="cx" name="complexity" className={nativeSelect} defaultValue={String(Number(s.complexity))}>
              {COMPLEXITIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
            </select>
          </div>
          <Button type="submit">Salvar Parâmetros</Button>
        </form>
      </Panel>
    </>
  );
}
