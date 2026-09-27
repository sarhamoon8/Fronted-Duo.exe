import type { EntidadMedica, Servicio } from "@/core/domain/entities/catalogo";
import type { Rol } from "@/core/domain/entities/rol";
import type { EstadoTurno, Turno } from "@/core/domain/entities/turno";
import type { Usuario } from "@/core/domain/entities/usuario";

/* ---------- DTOs tal como llegan por HTTP (fechas como string ISO) ---------- */

export interface UsuarioDto {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  creadoEn: string;
}

export interface TurnoDto {
  id: string;
  usuarioId: string;
  servicioId: string;
  estado: string;
  posicion: number | null;
  creadoEn: string;
}

export type EntidadMedicaDto = EntidadMedica;
export type ServicioDto = Servicio;


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
      creadoEn: new Date(dto.creadoEn),
    };
  },
};
