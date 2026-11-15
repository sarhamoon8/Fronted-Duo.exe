/** Espejo exacto del enum `EstadoTurno` del backend. */
export const ESTADOS_TURNO = ["PENDIENTE", "EN_CURSO", "ATENDIDO", "CANCELADO"] as const;
export type EstadoTurno = (typeof ESTADOS_TURNO)[number];

/** Espejo de TurnoResponseDto. */
export interface Turno {
  id: string;
  usuarioId: string;
  servicioId: string;
  puntoId: string;
  ventanillaId: string | null;
  codigoAlfanumerico: string;
  estado: EstadoTurno;
  prioridad: boolean;
  /** Solo los turnos PENDIENTE tienen posición; el resto llega en null. */
  posicion: number | null;
  /** Solo PENDIENTE: minutos que faltan para que lo llamen (estimado por el backend). */
  minutosEstimadosLlamado: number | null;
  /** Solo PENDIENTE: hora estimada de llamado; nunca es anterior a `llamableDesde`. */
  horaEstimadaLlamado: Date | null;
  /** Solo PENDIENTE: hasta esa hora no se llama el turno (margen para llegar a la sede). */
  llamableDesde: Date | null;
  horaLlamado: Date | null;
  horaFinalizacion: Date | null;
  creadoEn: Date;
}

export const ESTADO_TURNO_ETIQUETA: Record<EstadoTurno, string> = {
  PENDIENTE: "En espera",
  EN_CURSO: "En atención",
  ATENDIDO: "Atendido",
  CANCELADO: "Cancelado",
};

/**
 * Máquina de estados replicada de AvanzarTurnoUseCase (SIGUIENTE_ESTADO).
 * El backend sigue siendo la fuente de verdad: esto solo sirve para no
 * mostrar botones que el backend rechazaría con 400.
 */
const SIGUIENTE_ESTADO: Record<EstadoTurno, EstadoTurno | null> = {
  PENDIENTE: "EN_CURSO",
  EN_CURSO: "ATENDIDO",
  ATENDIDO: null,
  CANCELADO: null,
};

export function siguienteEstado(estado: EstadoTurno): EstadoTurno | null {
  return SIGUIENTE_ESTADO[estado];
}

export function puedeAvanzar(estado: EstadoTurno): boolean {
  return SIGUIENTE_ESTADO[estado] !== null;
}

/**
 * Margen de llegada (replica de MINUTOS_MINIMOS_ANTES_DE_LLAMADO del backend):
 * un turno no se llama antes de que pasen estos minutos desde que se pidió.
 */
export const MINUTOS_MARGEN_LLEGADA = 15;

/** ¿Ya pasó el margen de llegada y el personal puede llamar este turno? */
export function puedeLlamarse(t: Pick<Turno, "llamableDesde">, ahora: Date): boolean {
  return !t.llamableDesde || ahora.getTime() >= t.llamableDesde.getTime();
}

/** Regla de CancelarTurnoUseCase: ATENDIDO y CANCELADO no se cancelan. */
export function puedeCancelar(estado: EstadoTurno): boolean {
  return estado === "PENDIENTE" || estado === "EN_CURSO";
}

export function estaActivo(estado: EstadoTurno): boolean {
  return estado === "PENDIENTE" || estado === "EN_CURSO";
}

/**
 * El backend ya genera un código alfanumérico propio (codigoAlfanumerico,
 * p. ej. "T-8K3PQ2"); se prefiere siempre que exista. Este derivado del
 * UUID queda solo como respaldo para datos antiguos o de ejemplo.
 */
export function codigoCorto(id: string): string {
  return `T-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/** Código a mostrar en pantalla: el real del backend, con respaldo derivado del id. */
export function codigoTurno(t: Pick<Turno, "id" | "codigoAlfanumerico">): string {
  return t.codigoAlfanumerico || codigoCorto(t.id);
}

/**
 * Supuesto de negocio para estimar la espera mientras el backend no registre
 * tiempos de atención: minutos promedio que tarda cada turno.
 */
export const MINUTOS_POR_TURNO = 6;

/** Minutos de espera a mostrar: el estimado del backend o, si falta, uno local aproximado. */
export function minutosParaLlamado(t: Pick<Turno, "minutosEstimadosLlamado" | "posicion">): number | null {
  return t.minutosEstimadosLlamado ?? estimarEspera(t.posicion);
}

/** Espera estimada (min) para quien está en `posicion` (1 = siguiente). */
export function estimarEspera(posicion: number | null): number | null {
  if (posicion === null) return null;
  return Math.max(0, (posicion - 1) * MINUTOS_POR_TURNO);
}
