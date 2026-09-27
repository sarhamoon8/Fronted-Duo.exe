import type { TurnoRepository } from "@/core/domain/ports";
import type { Turno } from "@/core/domain/entities/turno";
import { internalApi } from "../http/internal-client";
import { TurnoMapper, type TurnoDto } from "../mappers";

/**
 * Endpoints de TurnoController:
 *   POST  /turnos                       (autenticado; usuarioId sale del token)
 *   GET   /turnos/servicio/:servicioId  (FUNCIONARIO, ADMIN)
 *   PATCH /turnos/:id/avanzar           (FUNCIONARIO, ADMIN)
 *   PATCH /turnos/:id/cancelar          (dueño del turno o staff)
 */
export class HttpTurnoRepository implements TurnoRepository {
  async solicitar(servicioId: string): Promise<Turno> {
    const { data } = await internalApi.post<TurnoDto>("/bff/turnos", { servicioId });
    return TurnoMapper.toDomain(data);
  }

  async cancelar(turnoId: string): Promise<Turno> {
    const { data } = await internalApi.patch<TurnoDto>(
      `/bff/turnos/${encodeURIComponent(turnoId)}/cancelar`,
    );
    return TurnoMapper.toDomain(data);
  }

  async avanzar(turnoId: string): Promise<Turno> {
    const { data } = await internalApi.patch<TurnoDto>(
      `/bff/turnos/${encodeURIComponent(turnoId)}/avanzar`,
    );
    return TurnoMapper.toDomain(data);
  }

  async listarPorServicio(servicioId: string): Promise<Turno[]> {
    const { data } = await internalApi.get<TurnoDto[]>(
      `/bff/turnos/servicio/${encodeURIComponent(servicioId)}`,
    );
    return data.map(TurnoMapper.toDomain);
  }
}
