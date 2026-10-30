import { describe, expect, it, vi, beforeEach } from "vitest";
import { internalApi } from "../http/internal-client";
import { HttpVentanillaRepository } from "./ventanilla.repository";

vi.mock("../http/internal-client", () => ({
  internalApi: { get: vi.fn() },
}));

describe("HttpVentanillaRepository", () => {
  beforeEach(() => {
    vi.mocked(internalApi.get).mockReset();
  });

  it("listarPorPunto llama a GET /bff/ventanillas con puntoId como param", async () => {
    const ventanillas = [{ id: "v1", puntoId: "punto-1", numeroModulo: "M1", estadoOperativo: "ACTIVA" as const }];
    vi.mocked(internalApi.get).mockResolvedValue({ data: ventanillas });
    const repo = new HttpVentanillaRepository();

    const resultado = await repo.listarPorPunto("punto-1");

    expect(internalApi.get).toHaveBeenCalledWith("/bff/ventanillas", { params: { puntoId: "punto-1" } });
    expect(resultado).toEqual(ventanillas);
  });
});
