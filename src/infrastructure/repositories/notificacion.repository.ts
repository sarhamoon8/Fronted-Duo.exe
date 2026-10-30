import type { NotificacionRepository } from "@/core/domain/ports";
import type { Notificacion } from "@/core/domain/entities/notificacion";
import { internalApi } from "../http/internal-client";
import { NotificacionMapper, type NotificacionDto } from "../mappers";

/**
 * Endpoints de NotificacionController:
 *   GET   /notificaciones/mis-notificaciones   (autenticado; más reciente primero)
 *   PATCH /notificaciones/:id/leida            (dueño de la notificación)
 */
export class HttpNotificacionRepository implements NotificacionRepository {
  async misNotificaciones(): Promise<Notificacion[]> {
    const { data } = await internalApi.get<NotificacionDto[]>("/bff/notificaciones/mis-notificaciones");
    return data.map(NotificacionMapper.toDomain);
  }

  async marcarLeida(notificacionId: string): Promise<Notificacion> {
    const { data } = await internalApi.patch<NotificacionDto>(
      `/bff/notificaciones/${encodeURIComponent(notificacionId)}/leida`,
    );
    return NotificacionMapper.toDomain(data);
  }
}
