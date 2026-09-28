import type { VentanillaRepository } from "../../domain/ports";

export class ListarVentanillasUseCase {
  constructor(private readonly repo: VentanillaRepository) {}
  ejecutar(puntoId: string) {
    return this.repo.listarPorPunto(puntoId);
  }
}
