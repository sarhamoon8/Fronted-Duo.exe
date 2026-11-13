export type EstadoCita = "PROGRAMADA" | "COMPLETADA" | "CANCELADA";

export const ESTADO_CITA_ETIQUETA: Record<EstadoCita, string> = {
  PROGRAMADA: "Programada",
  COMPLETADA: "Atendida",
  CANCELADA: "Cancelada",
};

/** Doctor asignado a una cita (espejo de ProfesionalCitaDto). */
export interface ProfesionalCita {
  id: string;
  nombres: string;
  apellidos: string;
  registroMedico: string;
}

/** Espejo de CitaResponseDto (POST /citas, GET /citas/mis-citas). */
export interface Cita {
  id: string;
  pacienteId: string;
  puntoId: string;
  especialidad: string;
  fechaHora: Date;
  estado: EstadoCita;
  /** El backend lo asigna automáticamente al agendar. */
  profesional: ProfesionalCita | null;
}

/** Una hora con al menos un doctor libre (GET /citas/disponibilidad). */
export interface FranjaDisponible {
  /** HH:mm en hora de Colombia. */
  hora: string;
  fechaHora: Date;
  doctoresDisponibles: number;
}

export interface DisponibilidadCitas {
  fecha: string;
  especialidad: string;
  puntoId: string;
  franjas: FranjaDisponible[];
}

/** Datos para pedir una cita; el doctor lo elige el sistema. */
export interface NuevaCita {
  puntoId: string;
  especialidad: string;
  /** Instante ISO de la franja elegida. */
  fechaHora: string;
}

/** Espejo de ProfesionalResponseDto (GET /profesionales, público). */
export interface Profesional {
  id: string;
  registroMedico: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  activo: boolean;
  puntoId: string;
}
