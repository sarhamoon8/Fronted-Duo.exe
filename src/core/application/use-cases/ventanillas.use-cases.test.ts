import { describe, expect, it, vi } from "vitest";
import type { VentanillaRepository } from "../../domain/ports";
import { AppError } from "../../domain/errors";
import { CrearVentanillaUseCase, ListarVentanillasUseCase } from "./ventanillas.use-cases";

describe("ListarVentanillasUseCase", () => {
  it("delega en ventanillaRepository.listarPorPunto", async () => {
    const repo: VentanillaRepository = { listarPorPunto: vi.fn().mockResolvedValue([]), crear: vi.fn() };
    const useCase = new ListarVentanillasUseCase(repo);

    await useCase.ejecutar("punto-1");

    expect(repo.listarPorPunto).toHaveBeenCalledWith("punto-1");
  });
});

describe("CrearVentanillaUseCase", () => {
  it("exige sede y número de módulo", () => {
    const repo: VentanillaRepository = { listarPorPunto: vi.fn(), crear: vi.fn() };
    const useCase = new CrearVentanillaUseCase(repo);

    expect(() => useCase.ejecutar("", "M1")).toThrow(AppError);
    expect(() => useCase.ejecutar("p1", "  ")).toThrow(AppError);
    expect(repo.crear).not.toHaveBeenCalled();
  });

  it("recorta el número de módulo y delega en el repositorio", async () => {
    const repo: VentanillaRepository = {
      listarPorPunto: vi.fn(),
      crear: vi.fn().mockResolvedValue({ id: "v1", puntoId: "p1", numeroModulo: "M3", estadoOperativo: "ACTIVA" }),
    };
    const useCase = new CrearVentanillaUseCase(repo);

    await useCase.ejecutar("p1", " M3 ");

    expect(repo.crear).toHaveBeenCalledWith("p1", "M3");
  });
});
