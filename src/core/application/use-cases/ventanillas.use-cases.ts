import type { VentanillaRepository } from "../../domain/ports";
import { AppError } from "../../domain/errors";

export class ListarVentanillasUseCase {
  constructor(private readonly repo: VentanillaRepository) {}
  ejecutar(puntoId: string) {
    return this.repo.listarPorPunto(puntoId);
  }
}

export class CrearVentanillaUseCase {
  constructor(private readonly repo: VentanillaRepository) {}
  ejecutar(puntoId: string, numeroModulo: string) {
    if (!puntoId) throw new AppError(["Elige la sede de la ventanilla."], 400);
    if (!numeroModulo.trim()) throw new AppError(["El número de módulo es obligatorio."], 400);
    return this.repo.crear(puntoId, numeroModulo.trim());
  }
}
