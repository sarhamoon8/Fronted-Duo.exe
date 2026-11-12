import type { EntidadMedica, PuntoDispensacion, Servicio, Ventanilla } from "@/core/domain/entities/catalogo";
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
