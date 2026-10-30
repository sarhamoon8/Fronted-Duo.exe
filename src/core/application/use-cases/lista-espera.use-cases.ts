import type { ListaEsperaRepository } from "../../domain/ports";
import { AppError } from "../../domain/errors";

export class UnirseListaEsperaUseCase {
  constructor(private readonly repo: ListaEsperaRepository) {}
  ejecutar(servicioId: string, puntoId: string) {
    if (!servicioId || !puntoId) {
      throw new AppError(["Elige la sede y el servicio para unirte a la lista de espera."], 400);
    }
    return this.repo.unirse(servicioId, puntoId);
  }
}

export class MisInscripcionesEsperaUseCase {
  constructor(private readonly repo: ListaEsperaRepository) {}
  ejecutar() {
    return this.repo.misInscripciones();
  }
}

export class SalirListaEsperaUseCase {
  constructor(private readonly repo: ListaEsperaRepository) {}
  ejecutar(inscripcionId: string) {
    return this.repo.salir(inscripcionId);
  }
}
