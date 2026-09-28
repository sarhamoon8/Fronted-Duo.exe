import type { EntidadMedica, PuntoDispensacion, Servicio, Ventanilla } from "@/core/domain/entities/catalogo";
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
