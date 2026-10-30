"use client";

import { useCallback, useMemo } from "react";
import { casosDeUso } from "@/infrastructure/container";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { useRecurso } from "./use-recurso";

export const INTERVALO_NOTIFICACIONES_MS = 30_000;

/** Notificaciones del usuario autenticado, actualizadas cada 30 s. */
export function useNotificaciones() {
  const usuario = useSesionStore((s) => s.usuario);
  const { datos, error, cargando, recargar } = useRecurso(
    `notificaciones:${usuario?.id ?? ""}`,
    () => casosDeUso.misNotificaciones.ejecutar(),
    { activo: !!usuario, intervaloMs: INTERVALO_NOTIFICACIONES_MS },
  );
  const notificaciones = useMemo(() => datos ?? [], [datos]);
  const sinLeer = useMemo(() => notificaciones.filter((n) => !n.leida), [notificaciones]);

  const marcarLeida = useCallback(
    async (id: string) => {
      await casosDeUso.marcarNotificacionLeida.ejecutar(id);
      recargar();
    },
    [recargar],
  );

  const marcarTodasLeidas = useCallback(async () => {
    await Promise.all(sinLeer.map((n) => casosDeUso.marcarNotificacionLeida.ejecutar(n.id)));
    recargar();
  }, [sinLeer, recargar]);

  return { notificaciones, sinLeer, cargando, error, marcarLeida, marcarTodasLeidas, recargar };
}
