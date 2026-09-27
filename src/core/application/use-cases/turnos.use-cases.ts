import type { TurnoRepository } from "../../domain/ports";
import type { EstadoTurno, Turno } from "../../domain/entities/turno";
import { puedeAvanzar, puedeCancelar } from "../../domain/entities/turno";
import { AppError } from "../../domain/errors";

export class SolicitarTurnoUseCase {
  constructor(private readonly repo: TurnoRepository) {}
  ejecutar(servicioId: string) {
    if (!servicioId) throw new AppError(["Selecciona un servicio."], 400);
    return this.repo.solicitar(servicioId);
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
  ejecutar(turno: Pick<Turno, "id" | "estado">) {
    if (!puedeAvanzar(turno.estado)) {
      throw new AppError([`Un turno ${turno.estado} no puede avanzar.`], 400);
    }
    return this.repo.avanzar(turno.id);
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
  async ejecutar(servicioId: string): Promise<ResumenFila> {
    // El backend ya devuelve la fila ordenada por creadoEn ascendente.
    const turnos = await this.repo.listarPorServicio(servicioId);
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
