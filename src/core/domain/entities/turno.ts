/** Espejo exacto del enum `EstadoTurno` del backend. */
export const ESTADOS_TURNO = ["PENDIENTE", "EN_CURSO", "ATENDIDO", "CANCELADO"] as const;
export type EstadoTurno = (typeof ESTADOS_TURNO)[number];

/** Espejo de TurnoResponseDto. */
export interface Turno {
  id: string;
  usuarioId: string;
  servicioId: string;
  estado: EstadoTurno;
  /** Solo los turnos PENDIENTE tienen posición; el resto llega en null. */
  posicion: number | null;
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

/** Regla de CancelarTurnoUseCase: ATENDIDO y CANCELADO no se cancelan. */
export function puedeCancelar(estado: EstadoTurno): boolean {
  return estado === "PENDIENTE" || estado === "EN_CURSO";
}

export function estaActivo(estado: EstadoTurno): boolean {
  return estado === "PENDIENTE" || estado === "EN_CURSO";
}

/**
 * El backend no genera un código alfanumérico; usamos un código corto
 * derivado del UUID solo como referencia visual para el usuario.
 */
export function codigoCorto(id: string): string {
  return `T-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/**
 * Supuesto de negocio para estimar la espera mientras el backend no registre
 * tiempos de atención: minutos promedio que tarda cada turno.
 */
export const MINUTOS_POR_TURNO = 6;

/** Espera estimada (min) para quien está en `posicion` (1 = siguiente). */
export function estimarEspera(posicion: number | null): number | null {
  if (posicion === null) return null;
  return Math.max(0, (posicion - 1) * MINUTOS_POR_TURNO);
}
