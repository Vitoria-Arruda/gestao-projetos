import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { maskPhone } from "@/lib/domain";
import { supabase } from "@/integrations/supabase/client";
import type { Client } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "./ui-bits";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(120),
  email: z.union([z.literal(""), z.string().trim().email("Email inválido").max(255)]),
  phone: z.string().trim().max(40),
  company: z.string().trim().max(120),
  notes: z.string().trim().max(2000),
});

export function ClientForm({ client }: { client?: Client }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos"); return; }
    setSaving(true);
    const res = client
      ? await supabase.from("clients").update(parsed.data).eq("id", client.id)
      : await supabase.from("clients").insert(parsed.data);
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    await qc.invalidateQueries({ queryKey: ["clients"] });
    toast.success("Cliente salvo");
    navigate({ to: "/clientes" });
  }

  const f = (id: keyof z.infer<typeof schema>, label: string, type = "text") => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} defaultValue={client?.[id] ?? ""} required={id === "name"} />
    </div>
  );

  return (
    <Panel>
      <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
        {f("name", "Nome")}
        {f("email", "Email", "email")}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={client?.phone ?? ""} placeholder="(00)00000-0000" onInput={(e) => { e.currentTarget.value = maskPhone(e.currentTarget.value); }} />
        </div>
        {f("company", "Empresa")}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" rows={4} defaultValue={client?.notes ?? ""} />
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={saving}>Salvar</Button>
          <Button type="button" variant="secondary" onClick={() => navigate({ to: "/clientes" })}>Cancelar</Button>
        </div>
      </form>
    </Panel>
  );
}
