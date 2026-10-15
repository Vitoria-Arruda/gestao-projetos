import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { settingsQuery } from "@/lib/api";
import { brl, calculatePrice } from "@/lib/domain";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel, nativeSelect } from "@/components/app/ui-bits";

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

function Calc() {
  const { data: s } = useQuery(settingsQuery);
  const [rate, setRate] = useState(100);
  const [hours, setHours] = useState(10);
  const [complexity, setComplexity] = useState(1);
  const [costs, setCosts] = useState(0);
  const [margin, setMargin] = useState(20);
  useEffect(() => {
    if (!s) return;
    setRate(Number(s.hourly_rate));
    setMargin(Number(s.margin));
    setComplexity(Number(s.complexity));
  }, [s]);

  const r = calculatePrice({ hourlyRate: rate, hours, complexity, extraCosts: costs, margin });
  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => set(Math.max(0, Number(e.target.value) || 0));

  return (
    <>
      <PageHeader title="Calculadora de precificação" subtitle="Valores padrão vêm dos seus Parâmetros" />
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="grid gap-5 sm:grid-cols-2 lg:col-span-3">
          <div className="space-y-2"><Label htmlFor="rate">Valor/hora (R$)</Label><Input id="rate" type="number" min="0" value={rate} onChange={num(setRate)} /></div>
          <div className="space-y-2"><Label htmlFor="hours">Horas estimadas</Label><Input id="hours" type="number" min="0" value={hours} onChange={num(setHours)} /></div>
          <div className="space-y-2">
            <Label htmlFor="cx">Complexidade</Label>
            <select id="cx" className={nativeSelect} value={complexity} onChange={(e) => setComplexity(Number(e.target.value))}>
              {COMPLEXITIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label htmlFor="costs">Custos adicionais (R$)</Label><Input id="costs" type="number" min="0" value={costs} onChange={num(setCosts)} /></div>
          <div className="space-y-2"><Label htmlFor="margin">Margem (%)</Label><Input id="margin" type="number" min="0" value={margin} onChange={num(setMargin)} /></div>
        </Panel>
        <div className="flex flex-col justify-between rounded-2xl bg-green p-6 text-on-color shadow-card lg:col-span-2">
          <p className="text-sm font-medium opacity-80">Preço sugerido</p>
          <p className="my-4 font-display text-4xl font-extrabold">{brl(r.total)}</p>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="opacity-80">Mão de obra</dt><dd>{brl(r.labor)}</dd></div>
            <div className="flex justify-between"><dt className="opacity-80">Custos</dt><dd>{brl(costs)}</dd></div>
            <div className="flex justify-between"><dt className="opacity-80">Margem</dt><dd>{brl(r.marginValue)}</dd></div>
          </dl>
        </div>
      </div>
    </>
  );
}
