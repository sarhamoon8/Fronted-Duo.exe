import { useMemo, useSyncExternalStore } from "react";
import type { PerfilGoogle } from "@/core/domain/entities/usuario";

/**
 * Registro con Google a medias: el correo de Google no tenía cuenta, así que se
 * guarda el token y el perfil mientras la persona completa su documento en
 * /registro. Vive en sessionStorage (solo esta pestaña); el token de Google
 * dura aproximadamente una hora.
 */
export interface PendienteGoogle {
  credential: string;
  perfil: PerfilGoogle;
}

const CLAVE = "filacero.registroGoogle";
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((oyente) => oyente());

export function guardarPendienteGoogle(pendiente: PendienteGoogle): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(pendiente));
  } catch {
    /* sin sessionStorage (modo privado): se pierde al recargar, no es grave */
  }
  avisar();
}

function leerCrudo(): string | null {
  try {
    return sessionStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

function interpretar(crudo: string | null): PendienteGoogle | null {
  if (!crudo) return null;
  try {
    const dato = JSON.parse(crudo) as Partial<PendienteGoogle>;
    return dato.credential && dato.perfil?.email ? (dato as PendienteGoogle) : null;
  } catch {
    return null;
  }
}

export function leerPendienteGoogle(): PendienteGoogle | null {
  return interpretar(leerCrudo());
}

/** El pendiente actual (null en el servidor y mientras no haya uno); se actualiza al guardarlo o borrarlo. */
export function usePendienteGoogle(): PendienteGoogle | null {
  const crudo = useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    leerCrudo,
    () => null,
  );
  return useMemo(() => interpretar(crudo), [crudo]);
}

export function borrarPendienteGoogle(): void {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    /* nada que borrar */
  }
  avisar();
}
