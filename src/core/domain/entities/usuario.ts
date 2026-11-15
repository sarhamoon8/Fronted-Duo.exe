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
  /** Aceptó los términos de uso y el tratamiento de datos personales. */
  aceptaTerminos: boolean;
}

/** Espejo de LoginDto (POST /auth/login). */
export interface Credenciales {
  email: string;
  password: string;
}

/** Datos que Google certifica del usuario (los devuelve el backend en un 428). */
export interface PerfilGoogle {
  email: string;
  nombres: string;
  apellidos: string;
}

/** Espejo de GoogleAuthDto (POST /auth/google). `credential` es el token de identidad de Google. */
export interface DatosGoogle {
  credential: string;
  numeroDocumento?: string;
  tipoDocumento?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  aceptaTerminos?: boolean;
}
