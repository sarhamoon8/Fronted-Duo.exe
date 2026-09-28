import type { TurnoRepository } from "@/core/domain/ports";
import type { Turno } from "@/core/domain/entities/turno";
import { internalApi } from "../http/internal-client";
import { TurnoMapper, type TurnoDto } from "../mappers";

/**
 * Endpoints de TurnoController:
 *   POST  /turnos                                (autenticado; usuarioId sale del token)
 *   GET   /turnos/mis-turnos                      (autenticado; turnos del usuario)
 *   GET   /turnos?puntoId=&servicioId=            (FUNCIONARIO, ADMIN; servicioId opcional)
 *   GET   /turnos/:id                             (dueño o staff)
 *   PATCH /turnos/:id/avanzar                     (FUNCIONARIO, ADMIN; ventanillaId solo al llamar)
 *   PATCH /turnos/:id/cancelar                    (dueño del turno o staff)
 */
export class HttpTurnoRepository implements TurnoRepository {
  async solicitar(servicioId: string, puntoId: string): Promise<Turno> {
    const { data } = await internalApi.post<TurnoDto>("/bff/turnos", { servicioId, puntoId });
    return TurnoMapper.toDomain(data);
  }

  async cancelar(turnoId: string): Promise<Turno> {
    const { data } = await internalApi.patch<TurnoDto>(
      `/bff/turnos/${encodeURIComponent(turnoId)}/cancelar`,
    );
    return TurnoMapper.toDomain(data);
  }

  async avanzar(turnoId: string, ventanillaId?: string): Promise<Turno> {
    const { data } = await internalApi.patch<TurnoDto>(
      `/bff/turnos/${encodeURIComponent(turnoId)}/avanzar`,
      ventanillaId ? { ventanillaId } : {},
    );
    return TurnoMapper.toDomain(data);
  }

  async listarPorPunto(puntoId: string, servicioId?: string): Promise<Turno[]> {
    const { data } = await internalApi.get<TurnoDto[]>("/bff/turnos", {
      params: servicioId ? { puntoId, servicioId } : { puntoId },
    });
    return data.map(TurnoMapper.toDomain);
  }

  async misTurnos(): Promise<Turno[]> {
    const { data } = await internalApi.get<TurnoDto[]>("/bff/turnos/mis-turnos");
    return data.map(TurnoMapper.toDomain);
  }
}
