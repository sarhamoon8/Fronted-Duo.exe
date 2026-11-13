export type TipoNotificacion =
  | "TURNO_CREADO"
  | "TURNO_CANCELADO"
  | "TURNO_EN_CURSO"
  | "TURNO_REASIGNADO"
  | "CITA_AGENDADA"
  | "CITA_CANCELADA"
  | "CITA_REPROGRAMADA";

export type EstadoEnvioNotificacion = "ENVIADA" | "FALLIDA";

/** Espejo de NotificacionResponseDto (GET /notificaciones/mis-notificaciones). */
export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  estadoEnvio: EstadoEnvioNotificacion;
  leida: boolean;
  creadoEn: Date;
}

export const TIPO_NOTIFICACION_ETIQUETA: Record<TipoNotificacion, string> = {
  TURNO_CREADO: "Turno solicitado",
  TURNO_CANCELADO: "Turno cancelado",
  TURNO_EN_CURSO: "Tu turno fue llamado",
  TURNO_REASIGNADO: "Turno reasignado",
  CITA_AGENDADA: "Cita confirmada",
  CITA_CANCELADA: "Cita cancelada",
  CITA_REPROGRAMADA: "Cita reprogramada",
};
