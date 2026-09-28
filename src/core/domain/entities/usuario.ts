import type { Rol } from "./rol";

/** Espejo de UsuarioResponseDto. */
export interface Usuario {
  id: string;
  numeroDocumento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  rol: Rol;
  creadoEn: Date;
}

/** Espejo de CrearUsuarioDto (POST /usuarios, solo ADMIN). */
export interface NuevoUsuario {
  numeroDocumento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  rol?: Rol;
}

/** Espejo de RegisterDto (POST /auth/register). Siempre crea rol PACIENTE. */
export interface DatosRegistro {
  numeroDocumento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
}

/** Espejo de LoginDto (POST /auth/login). */
export interface Credenciales {
  email: string;
  password: string;
}
