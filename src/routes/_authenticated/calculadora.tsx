import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { settingsQuery } from "@/lib/api";
import { brl, calculatePrice } from "@/lib/domain";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PageHeader, Panel } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/calculadora")({
  head: () => ({ meta: [{ title: "Calculadora de preço — Freela Hub" }, { name: "description", content: "Calcule o preço sugerido de um projeto." }] }),
  component: Calc,
});

export const COMPLEXITIES = [
  { v: 0.8, l: "Baixa (×0,8)" },
  { v: 1, l: "Média (×1,0)" },
  { v: 1.3, l: "Alta (×1,3)" },
  { v: 1.6, l: "Muito alta (×1,6)" },
];

const levelLabel = (v: number) => (v < 0.95 ? "Baixa" : v < 1.25 ? "Média" : v < 1.5 ? "Alta" : "Muito alta");

type Cost = { id: number; desc: string; value: number };

function Calc() {
  const { data: s } = useQuery(settingsQuery);
  const [rate, setRate] = useState(100);
  const [hours, setHours] = useState(10);
  const [complexity, setComplexity] = useState(1);
  const [costs, setCosts] = useState<Cost[]>([]);
  useEffect(() => {
    if (!s) return;
    setRate(Number(s.hourly_rate));
    setComplexity(Number(s.complexity));
  }, [s]);

  const extra = costs.reduce((t, c) => t + c.value, 0);
  const r = calculatePrice({ hourlyRate: rate, hours, complexity, extraCosts: extra, margin: 0 });
  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => set(Math.max(0, Number(e.target.value) || 0));
  const upd = (id: number, p: Partial<Cost>) => setCosts((l) => l.map((c) => (c.id === id ? { ...c, ...p } : c)));

  return (
    <>
      <PageHeader title="Calculadora de precificação" subtitle="Valores padrão vêm dos seus Parâmetros" />
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="grid content-start gap-5 sm:grid-cols-2 lg:col-span-3">
          <div className="space-y-2"><Label htmlFor="rate">Valor/hora (R$)</Label><Input id="rate" type="number" min="0" value={rate} onChange={num(setRate)} /></div>
          <div className="space-y-2"><Label htmlFor="hours">Horas estimadas</Label><Input id="hours" type="number" min="0" value={hours} onChange={num(setHours)} /></div>
          <div className="space-y-3 sm:col-span-2">
            <div className="flex justify-between">
              <Label>Complexidade</Label>
              <span className="text-sm font-medium">{levelLabel(complexity)} (×{complexity.toFixed(1).replace(".", ",")})</span>
            </div>
            <Slider min={0.8} max={1.6} step={0.1} value={[complexity]} onValueChange={(v) => setComplexity(Number((v[0] ?? 1).toFixed(1)))} />
            <div className="flex justify-between text-xs text-muted-foreground"><span>Baixa</span><span>Média</span><span>Alta</span><span>Muito alta</span></div>
          </div>
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Custos adicionais</Label>
              <Button type="button" size="sm" variant="secondary" onClick={() => setCosts((l) => [...l, { id: Date.now(), desc: "", value: 0 }])}><Plus /> Adicionar custo</Button>
            </div>
            {costs.length === 0 && <p className="text-sm text-muted-foreground">Nenhum custo adicionado.</p>}
            {costs.map((c) => (
              <div key={c.id} className="flex gap-2">
                <Input placeholder="Descrição" value={c.desc} onChange={(e) => upd(c.id, { desc: e.target.value })} />
                <Input className="w-36" type="number" min="0" step="0.01" placeholder="Valor (R$)" value={c.value} onChange={(e) => upd(c.id, { value: Math.max(0, Number(e.target.value) || 0) })} />
                <Button type="button" size="icon" variant="ghost" aria-label="Remover custo" onClick={() => setCosts((l) => l.filter((x) => x.id !== c.id))}><Trash2 /></Button>
              </div>
            ))}
          </div>
        </Panel>
        <div className="flex flex-col justify-between rounded-2xl bg-green p-6 text-on-color shadow-card lg:col-span-2">
          <p className="text-sm font-medium opacity-80">Preço sugerido</p>
          <p className="my-4 font-display text-4xl font-extrabold">{brl(r.total)}</p>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="opacity-80">Mão de obra</dt><dd>{brl(r.labor)}</dd></div>
            {costs.map((c) => (
              <div key={c.id} className="flex justify-between"><dt className="opacity-80">{c.desc || "Custo"}</dt><dd>{brl(c.value)}</dd></div>
            ))}
            <div className="flex justify-between"><dt className="opacity-80">Total de custos</dt><dd>{brl(extra)}</dd></div>
          </dl>
        </div>
      </div>
    </>
  );
}
