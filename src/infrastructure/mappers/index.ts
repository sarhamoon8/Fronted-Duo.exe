import type { EntidadMedica, PuntoDispensacion, Servicio, Ventanilla } from "@/core/domain/entities/catalogo";
import type { Cita, DisponibilidadCitas, EstadoCita } from "@/core/domain/entities/cita";
import type { InscripcionEspera } from "@/core/domain/entities/lista-espera";
import type { ExistenciaMedicamento } from "@/core/domain/entities/medicamento";
import type {
  EstadoEnvioNotificacion,
  Notificacion,
  TipoNotificacion,
} from "@/core/domain/entities/notificacion";
import type { Rol } from "@/core/domain/entities/rol";
import type { EstadoTurno, Turno } from "@/core/domain/entities/turno";
import type { Usuario } from "@/core/domain/entities/usuario";

/* ---------- DTOs tal como llegan por HTTP (fechas como string ISO) ---------- */

export interface UsuarioDto {
  id: string;
  numeroDocumento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  rol: string;
  creadoEn: string;
}

export interface TurnoDto {
  id: string;
  usuarioId: string;
  servicioId: string;
  puntoId: string;
  ventanillaId: string | null;
  codigoAlfanumerico: string;
  estado: string;
  prioridad: boolean;
  posicion: number | null;
  minutosEstimadosLlamado?: number | null;
  horaEstimadaLlamado?: string | null;
  llamableDesde?: string | null;
  horaLlamado: string | null;
  horaFinalizacion: string | null;
  creadoEn: string;
}

export type EntidadMedicaDto = EntidadMedica;
export type ServicioDto = Servicio;
export type PuntoDispensacionDto = PuntoDispensacion;
export type VentanillaDto = Ventanilla;

/* ---------------------------------- Mappers --------------------------------- */

export const UsuarioMapper = {
  toDomain(dto: UsuarioDto): Usuario {
    return { ...dto, rol: dto.rol as Rol, creadoEn: new Date(dto.creadoEn) };
  },
};

export const TurnoMapper = {
  toDomain(dto: TurnoDto): Turno {
    return {
      ...dto,
      estado: dto.estado as EstadoTurno,
      minutosEstimadosLlamado: dto.minutosEstimadosLlamado ?? null,
      horaEstimadaLlamado: dto.horaEstimadaLlamado ? new Date(dto.horaEstimadaLlamado) : null,
      llamableDesde: dto.llamableDesde ? new Date(dto.llamableDesde) : null,
      horaLlamado: dto.horaLlamado ? new Date(dto.horaLlamado) : null,
      horaFinalizacion: dto.horaFinalizacion ? new Date(dto.horaFinalizacion) : null,
      creadoEn: new Date(dto.creadoEn),
    };
  },
};

export interface InscripcionEsperaDto {
  id: string;
  usuarioId: string;
  servicioId: string;
  puntoId: string;
  creadoEn: string;
  posicion: number;
}

export interface NotificacionDto {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  estadoEnvio: string;
  leida: boolean;
  creadoEn: string;
}

export interface ExistenciaMedicamentoDto {
  id: string;
  puntoId: string;
  medicamentoId: string;
  lote: string;
  stockActual: number;
  stockReservado: number;
  cantidadDisponible: number;
  disponible: boolean;
  fechaVencimiento: string;
}

export interface CitaDto {
  id: string;
  pacienteId: string;
  puntoId: string;
  especialidad: string;
  fechaHora: string;
  estado: string;
  profesional: { id: string; nombres: string; apellidos: string; registroMedico: string } | null;
}

export interface DisponibilidadCitasDto {
  fecha: string;
  especialidad: string;
  puntoId: string;
  franjas: { hora: string; fechaHora: string; doctoresDisponibles: number }[];
}

export const CitaMapper = {
  toDomain(dto: CitaDto): Cita {
    return { ...dto, estado: dto.estado as EstadoCita, fechaHora: new Date(dto.fechaHora) };
  },
};

export const DisponibilidadCitasMapper = {
  toDomain(dto: DisponibilidadCitasDto): DisponibilidadCitas {
    return { ...dto, franjas: dto.franjas.map((f) => ({ ...f, fechaHora: new Date(f.fechaHora) })) };
  },
};

export const InscripcionEsperaMapper = {
  toDomain(dto: InscripcionEsperaDto): InscripcionEspera {
    return { ...dto, creadoEn: new Date(dto.creadoEn) };
  },
};

export const NotificacionMapper = {
  toDomain(dto: NotificacionDto): Notificacion {
    return {
      ...dto,
      tipo: dto.tipo as TipoNotificacion,
      estadoEnvio: dto.estadoEnvio as EstadoEnvioNotificacion,
      creadoEn: new Date(dto.creadoEn),
    };
  },
};

export const ExistenciaMedicamentoMapper = {
  toDomain(dto: ExistenciaMedicamentoDto): ExistenciaMedicamento {
    return { ...dto, fechaVencimiento: new Date(dto.fechaVencimiento) };
  },
};
