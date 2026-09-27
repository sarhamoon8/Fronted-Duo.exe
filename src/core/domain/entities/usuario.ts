import type { Rol } from "./rol";

/** Espejo de UsuarioResponseDto. */
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  creadoEn: Date;
}

/** Espejo de CrearUsuarioDto (POST /usuarios, solo ADMIN). */
export interface NuevoUsuario {
  nombre: string;
  email: string;
  password: string;
  rol?: Rol;
}

/** Espejo de RegisterDto (POST /auth/register). */
export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

/** Espejo de LoginDto (POST /auth/login). */
export interface Credenciales {
  email: string;
  password: string;
}
