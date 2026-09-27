import type { JwtPayload, Sesion } from "@/core/domain/entities/sesion";
import { ROLES, type Rol } from "@/core/domain/entities/rol";

/**
 * Decodifica (sin verificar la firma) el payload de un JWT.
 *
 * El frontend no conoce JWT_SECRET y no lo necesita: la verificación real la
 * hace el backend en cada petición (JwtAuthGuard). Aquí solo leemos los
 * claims para pintar la interfaz y redirigir por rol. Funciona tanto en el
 * runtime de Node como en el de proxy.ts.
 */
export function decodificarJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(padded), (c) => c.charCodeAt(0)),
    );
    const data = JSON.parse(json) as Partial<JwtPayload>;
    if (!data.sub || !data.email || !ROLES.includes(data.rol as Rol)) return null;
    return data as JwtPayload;
  } catch {
    return null;
  }
}

export function tokenExpirado(payload: JwtPayload, margenSeg = 5): boolean {
  if (!payload.exp) return false;
  return payload.exp - margenSeg <= Math.floor(Date.now() / 1000);
}

export function sesionDesdePayload(payload: JwtPayload, nombre?: string): Sesion {
  return {
    id: payload.sub,
    email: payload.email,
    rol: payload.rol,
    nombre: nombre ?? payload.email.split("@")[0],
    expiraEn: payload.exp ? payload.exp * 1000 : null,
  };
}
