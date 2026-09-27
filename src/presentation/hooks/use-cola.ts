"use client";

import { useCallback, useEffect, useState } from "react";
import type { ResumenFila } from "@/core/application/use-cases/turnos.use-cases";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useCatalogo } from "./use-catalogo";
import { useFilaStore } from "@/presentation/stores/fila.store";
import { useSesionStore } from "@/presentation/stores/sesion.store";

export const INTERVALO_COLA_MS = 10_000;

/**
 * Estado compartido por las vistas del personal de atención: puesto
 * (entidad + servicio), fila del servicio con auto-actualización y nombres
 * de pacientes (solo si el rol es ADMIN, que puede listar usuarios).
 */
export function useCola() {
  const rol = useSesionStore((s) => s.usuario?.rol);
  const { entidadId, servicioId, autoActualizar, setEntidad, setServicio, setAutoActualizar } = useFilaStore();
  const catalogo = useCatalogo(entidadId);

  const [datos, setDatos] = useState<{ servicioId: string; resumen: ResumenFila; en: Date } | null>(null);
  const [errorCarga, setErrorCarga] = useState<{ servicioId: string; mensaje: string } | null>(null);
  const [nombres, setNombres] = useState<Record<string, string>>({});

  const fila = datos?.servicioId === servicioId ? datos.resumen : null;
  const ultimaCarga = datos?.servicioId === servicioId ? datos.en : null;
  const error = errorCarga?.servicioId === servicioId ? errorCarga.mensaje : null;

  useEffect(() => {
    if (rol !== "ADMIN") return;
    casosDeUso.listarUsuarios
      .ejecutar()
      .then((us) => setNombres(Object.fromEntries(us.map((u) => [u.id, u.nombre]))))
      .catch(() => undefined);
  }, [rol]);

  const recargar = useCallback(async () => {
    if (!servicioId) return;
    try {
      const resumen = await casosDeUso.consultarFila.ejecutar(servicioId);
      setDatos({ servicioId, resumen, en: new Date() });
      setErrorCarga(null);
    } catch (e) {
      setErrorCarga({ servicioId, mensaje: mensajeDeError(e) });
    }
  }, [servicioId]);

  useEffect(() => {
    if (!servicioId) return;
    let vigente = true;
    casosDeUso.consultarFila
      .ejecutar(servicioId)
      .then((resumen) => vigente && setDatos({ servicioId, resumen, en: new Date() }))
      .catch((e) => vigente && setErrorCarga({ servicioId, mensaje: mensajeDeError(e) }));
    return () => {
      vigente = false;
    };
  }, [servicioId]);

  // El backend no expone WebSockets/SSE: se consulta cada 10 s.
  useEffect(() => {
    if (!servicioId || !autoActualizar) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void recargar();
    }, INTERVALO_COLA_MS);
    return () => window.clearInterval(id);
  }, [servicioId, autoActualizar, recargar]);

  const entidad = catalogo.entidades.find((e) => e.id === entidadId);
  const servicio = catalogo.servicios.find((s) => s.id === servicioId);

  return {
    ...catalogo,
    entidadId,
    servicioId,
    entidad,
    servicio,
    setEntidad,
    setServicio,
    autoActualizar,
    setAutoActualizar,
    fila,
    ultimaCarga,
    errorFila: error,
    cargandoFila: !!servicioId && !fila && !error,
    recargar,
    nombrePaciente: (usuarioId: string) => nombres[usuarioId] ?? `Paciente ${usuarioId.slice(0, 6).toUpperCase()}`,
  };
}

export type ColaState = ReturnType<typeof useCola>;
