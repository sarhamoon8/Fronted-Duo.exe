import "server-only";
import { cookies } from "next/headers";
import { serverEnv } from "@/config/env";
import type { Sesion } from "@/core/domain/entities/sesion";
import { crearBackendClient } from "./backend-client";
import { decodificarJwt, sesionDesdePayload, tokenExpirado } from "./jwt";

export const COOKIE_MAX_AGE_POR_DEFECTO = 60 * 60 * 24; // 1 día, igual que expiresIn del backend

export function opcionesCookie(maxAge: number) {
  return {
    httpOnly: true,
    secure: serverEnv.isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Segundos que le quedan al token, para que la cookie muera con él. */
export function maxAgeDesdeToken(token: string): number {
  const payload = decodificarJwt(token);
  if (!payload?.exp) return COOKIE_MAX_AGE_POR_DEFECTO;
  return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
}

export async function leerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(serverEnv.authCookieName)?.value ?? null;
}

/**
 * Construye la sesión a partir del token: los claims salen del JWT y el
 * nombre de GET /usuarios/:id (el backend permite consultar el perfil propio).
 * Si el backend responde 401 el token ya no sirve y devolvemos null.
 */
export async function construirSesion(token: string): Promise<Sesion | null> {
  const payload = decodificarJwt(token);
  if (!payload || tokenExpirado(payload)) return null;

  try {
    const res = await crearBackendClient(token).get<{ nombre?: string }>(
      `/usuarios/${encodeURIComponent(payload.sub)}`,
    );
    if (res.status === 401) return null;
    return sesionDesdePayload(payload, res.status === 200 ? res.data.nombre : undefined);
  } catch {
    // Backend caído: seguimos con los datos del token para no romper la UI.
    return sesionDesdePayload(payload);
  }
}

/** Para Server Components y layouts protegidos. */
export async function obtenerSesionServidor(): Promise<Sesion | null> {
  const token = await leerToken();
  return token ? construirSesion(token) : null;
}
