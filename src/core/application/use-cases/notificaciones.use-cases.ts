import type { NotificacionRepository } from "../../domain/ports";

export class MisNotificacionesUseCase {
  constructor(private readonly repo: NotificacionRepository) {}
  ejecutar() {
    return this.repo.misNotificaciones();
  }
}

export class MarcarNotificacionLeidaUseCase {
  constructor(private readonly repo: NotificacionRepository) {}
  ejecutar(notificacionId: string) {
    return this.repo.marcarLeida(notificacionId);
  }
}
