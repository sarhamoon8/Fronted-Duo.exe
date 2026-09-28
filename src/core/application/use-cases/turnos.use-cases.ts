import type { TurnoRepository } from "../../domain/ports";
import type { EstadoTurno, Turno } from "../../domain/entities/turno";
import { puedeAvanzar, puedeCancelar } from "../../domain/entities/turno";
import { AppError } from "../../domain/errors";

export class SolicitarTurnoUseCase {
  constructor(private readonly repo: TurnoRepository) {}
  ejecutar(servicioId: string, puntoId: string) {
    const errores: string[] = [];
    if (!servicioId) errores.push("Selecciona un servicio.");
    if (!puntoId) errores.push("Selecciona un punto de atención.");
    if (errores.length) throw new AppError(errores, 400);
    return this.repo.solicitar(servicioId, puntoId);
  }
}

export class CancelarTurnoUseCase {
  constructor(private readonly repo: TurnoRepository) {}
  ejecutar(turno: Pick<Turno, "id" | "estado">) {
    if (!puedeCancelar(turno.estado)) {
      throw new AppError([`Un turno ${turno.estado} no puede cancelarse.`], 400);
    }
    return this.repo.cancelar(turno.id);
  }
}

export class AvanzarTurnoUseCase {
  constructor(private readonly repo: TurnoRepository) {}
  /** ventanillaId es obligatorio solo para llamar un turno PENDIENTE (ver AvanzarTurnoUseCase del backend). */
  ejecutar(turno: Pick<Turno, "id" | "estado">, ventanillaId?: string) {
    if (!puedeAvanzar(turno.estado)) {
      throw new AppError([`Un turno ${turno.estado} no puede avanzar.`], 400);
    }
    if (turno.estado === "PENDIENTE" && !ventanillaId) {
      throw new AppError(["Selecciona la ventanilla desde la que vas a llamar."], 400);
    }
    return this.repo.avanzar(turno.id, ventanillaId);
  }
}

export interface ResumenFila {
  turnos: Turno[];
  conteo: Record<EstadoTurno, number>;
  /** Primer turno PENDIENTE (el siguiente a llamar), si existe. */
  siguiente: Turno | null;
}

export class ConsultarFilaUseCase {
  constructor(private readonly repo: TurnoRepository) {}
  async ejecutar(puntoId: string, servicioId?: string): Promise<ResumenFila> {
    // El backend ya devuelve la fila ordenada por creadoEn ascendente.
    const turnos = await this.repo.listarPorPunto(puntoId, servicioId);
    const conteo: Record<EstadoTurno, number> = {
      PENDIENTE: 0,
      EN_CURSO: 0,
      ATENDIDO: 0,
      CANCELADO: 0,
    };
    for (const t of turnos) conteo[t.estado]++;
    const siguiente = turnos.find((t) => t.estado === "PENDIENTE") ?? null;
    return { turnos, conteo, siguiente };
  }
}

export class MisTurnosUseCase {
  constructor(private readonly repo: TurnoRepository) {}
  ejecutar() {
    return this.repo.misTurnos();
  }
}
