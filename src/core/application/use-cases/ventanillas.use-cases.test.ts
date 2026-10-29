import { describe, expect, it, vi } from "vitest";
import type { VentanillaRepository } from "../../domain/ports";
import { ListarVentanillasUseCase } from "./ventanillas.use-cases";

describe("ListarVentanillasUseCase", () => {
  it("delega en ventanillaRepository.listarPorPunto", async () => {
    const repo: VentanillaRepository = { listarPorPunto: vi.fn().mockResolvedValue([]) };
    const useCase = new ListarVentanillasUseCase(repo);

    await useCase.ejecutar("punto-1");

    expect(repo.listarPorPunto).toHaveBeenCalledWith("punto-1");
  });
});
