import { describe, expect, it, vi, beforeEach } from "vitest";
import { internalApi } from "../http/internal-client";
import { HttpVentanillaRepository } from "./ventanilla.repository";

vi.mock("../http/internal-client", () => ({
  internalApi: { get: vi.fn(), post: vi.fn() },
}));

describe("HttpVentanillaRepository", () => {
  beforeEach(() => {
    vi.mocked(internalApi.get).mockReset();
    vi.mocked(internalApi.post).mockReset();
  });

  it("listarPorPunto llama a GET /bff/ventanillas con puntoId como param", async () => {
    const ventanillas = [{ id: "v1", puntoId: "punto-1", numeroModulo: "M1", estadoOperativo: "ACTIVA" as const }];
    vi.mocked(internalApi.get).mockResolvedValue({ data: ventanillas });
    const repo = new HttpVentanillaRepository();

    const resultado = await repo.listarPorPunto("punto-1");

    expect(internalApi.get).toHaveBeenCalledWith("/bff/ventanillas", { params: { puntoId: "punto-1" } });
    expect(resultado).toEqual(ventanillas);
  });

  it("crear llama a POST /bff/ventanillas con puntoId y numeroModulo", async () => {
    const creada = { id: "v2", puntoId: "punto-1", numeroModulo: "M2", estadoOperativo: "ACTIVA" as const };
    vi.mocked(internalApi.post).mockResolvedValue({ data: creada });
    const repo = new HttpVentanillaRepository();

    const resultado = await repo.crear("punto-1", "M2");

    expect(internalApi.post).toHaveBeenCalledWith("/bff/ventanillas", { puntoId: "punto-1", numeroModulo: "M2" });
    expect(resultado).toEqual(creada);
  });
});
