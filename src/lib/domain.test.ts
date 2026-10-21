import { describe, expect, it } from "vitest";
import {
  calculatePrice,
  filterProjects,
  formatValueInput,
  maskPhone,
  parseValueInput,
  DEFAULT_STATUS,
} from "./domain";

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
  it("formata valor com . de milhar e , de centavos", () => {
    expect(formatValueInput("150000")).toBe("1.500,00");
    expect(formatValueInput("1234")).toBe("12,34");
  });
  it("lê valor formatado de volta como número", () => {
    expect(parseValueInput("1.500,00")).toBe(1500);
    expect(parseValueInput("12,34")).toBe(12.34);
    expect(parseValueInput("")).toBe(0);
  });
  it("mascara telefone como (00)00000-0000", () => {
    expect(maskPhone("11987654321")).toBe("(11)98765-4321");
    expect(maskPhone("1198765432")).toBe("(11)9876-5432");
    expect(maskPhone("1198765")).toBe("(11)98765");
    expect(maskPhone("(11) 98765-4321")).toBe("(11)98765-4321");
  });
});
