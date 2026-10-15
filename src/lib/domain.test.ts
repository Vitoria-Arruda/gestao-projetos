import { describe, expect, it } from "vitest";
import { calculatePrice, filterProjects, DEFAULT_STATUS } from "./domain";

const list = [
  { name: "Site Alfa", client_id: "a", status: "Em andamento", deadline: "2026-12-01" },
  { name: "App Beta", client_id: "b", status: "Concluído", deadline: "2026-11-01" },
  { name: "Site Gama", client_id: "a", status: "Em andamento", deadline: "2026-10-20" },
  { name: "Logo", client_id: "a", status: "Em andamento", deadline: null },
];

describe("regras", () => {
  it("status padrão é Em andamento", () => expect(DEFAULT_STATUS).toBe("Em andamento"));
  it("ordena por prazo crescente", () => {
    expect(filterProjects(list, {}).map((p) => p.name)).toEqual(["Site Gama", "App Beta", "Site Alfa", "Logo"]);
  });
  it("combina cliente + status + busca", () => {
    const r = filterProjects(list, { clientId: "a", status: "Em andamento", search: "site" });
    expect(r.map((p) => p.name)).toEqual(["Site Gama", "Site Alfa"]);
  });
  it("calcula preço", () => {
    expect(calculatePrice({ hourlyRate: 100, hours: 10, complexity: 1.5, extraCosts: 500, margin: 20 }).total).toBe(2400);
  });
});
