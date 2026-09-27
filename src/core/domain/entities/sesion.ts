import type { Rol } from "./rol";

/**
 * Payload del JWT que firma el backend (auth/domain/jwt-payload.interface.ts)
 * más los claims estándar que añade @nestjs/jwt.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  rol: Rol;
  iat?: number;
  exp?: number;
}

/** Usuario autenticado tal como lo consume la interfaz. */
export interface Sesion {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  /** Fecha de expiración del token (epoch ms), si viene en el JWT. */
  expiraEn: number | null;
}
