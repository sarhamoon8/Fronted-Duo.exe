"use client";

import { useCallback, useEffect, useState } from "react";
import type { Ventanilla } from "@/core/domain/entities/catalogo";
import type { ResumenFila } from "@/core/application/use-cases/turnos.use-cases";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useCatalogo } from "./use-catalogo";
import { useFilaStore } from "@/presentation/stores/fila.store";
import { useSesionStore } from "@/presentation/stores/sesion.store";

export const INTERVALO_COLA_MS = 10_000;

/**
 * Estado compartido por las vistas del personal de atención: puesto
 * (entidad + punto + servicio + ventanilla), fila del punto con
 * auto-actualización y nombres de pacientes (solo si el rol es ADMIN, que
 * puede listar usuarios).
 */
export function useCola() {
  const rol = useSesionStore((s) => s.usuario?.rol);
  const {
    entidadId,
    puntoId,
    servicioId,
    ventanillaId,
    autoActualizar,
    setEntidad,
    setPunto,
    setServicio,
    setVentanilla,
    setAutoActualizar,
  } = useFilaStore();
  const catalogo = useCatalogo(entidadId);

  const [ventanillas, setVentanillas] = useState<Cargado<Ventanilla[]> | null>(null);
  const [datos, setDatos] = useState<{ puntoId: string; servicioId: string; resumen: ResumenFila; en: Date } | null>(
    null,
  );
  const [errorCarga, setErrorCarga] = useState<{ puntoId: string; servicioId: string; mensaje: string } | null>(
    null,
  );
  const [nombres, setNombres] = useState<Record<string, string>>({});

  const coincide = datos?.puntoId === puntoId && datos?.servicioId === servicioId;
  const fila = coincide ? datos.resumen : null;
  const ultimaCarga = coincide ? datos.en : null;
  const errorCoincide = errorCarga?.puntoId === puntoId && errorCarga?.servicioId === servicioId;
  const error = errorCoincide ? errorCarga.mensaje : null;

  useEffect(() => {
    if (rol !== "ADMIN") return;
    casosDeUso.listarUsuarios
      .ejecutar()
      .then((us) => setNombres(Object.fromEntries(us.map((u) => [u.id, `${u.nombres} ${u.apellidos}`]))))
      .catch(() => undefined);
  }, [rol]);

  useEffect(() => {
    if (!puntoId) return;
    let vigente = true;
    casosDeUso.listarVentanillas
      .ejecutar(puntoId)
      .then((datos) => vigente && setVentanillas({ clave: puntoId, datos, error: null }))
      .catch((e) => vigente && setVentanillas({ clave: puntoId, datos: [], error: mensajeDeError(e) }));
    return () => {
      vigente = false;
    };
  }, [puntoId]);

  const recargar = useCallback(async () => {
    if (!puntoId) return;
    try {
      const resumen = await casosDeUso.consultarFila.ejecutar(puntoId, servicioId || undefined);
      setDatos({ puntoId, servicioId, resumen, en: new Date() });
      setErrorCarga(null);
    } catch (e) {
      setErrorCarga({ puntoId, servicioId, mensaje: mensajeDeError(e) });
    }
  }, [puntoId, servicioId]);

  useEffect(() => {
    if (!puntoId) return;
    let vigente = true;
    casosDeUso.consultarFila
      .ejecutar(puntoId, servicioId || undefined)
      .then((resumen) => vigente && setDatos({ puntoId, servicioId, resumen, en: new Date() }))
      .catch((e) => vigente && setErrorCarga({ puntoId, servicioId, mensaje: mensajeDeError(e) }));
    return () => {
      vigente = false;
    };
  }, [puntoId, servicioId]);

  // El backend no expone WebSockets/SSE: se consulta cada 10 s.
  useEffect(() => {
    if (!puntoId || !autoActualizar) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void recargar();
    }, INTERVALO_COLA_MS);
    return () => window.clearInterval(id);
  }, [puntoId, autoActualizar, recargar]);

  const entidad = catalogo.entidades.find((e) => e.id === entidadId);
  const punto = catalogo.puntos.find((p) => p.id === puntoId);
  const servicio = catalogo.servicios.find((s) => s.id === servicioId);
  const ventanillasVigentes = ventanillas?.clave === puntoId ? ventanillas : null;

  return {
    ...catalogo,
    entidadId,
    puntoId,
    servicioId,
    ventanillaId,
    entidad,
    punto,
    servicio,
    setEntidad,
    setPunto,
    setServicio,
    setVentanilla,
    ventanillas: ventanillasVigentes?.datos ?? [],
    cargandoVentanillas: !!puntoId && !ventanillasVigentes,
    autoActualizar,
    setAutoActualizar,
    fila,
    ultimaCarga,
    errorFila: error,
    cargandoFila: !!puntoId && !fila && !error,
    recargar,
    nombrePaciente: (usuarioId: string) => nombres[usuarioId] ?? `Paciente ${usuarioId.slice(0, 6).toUpperCase()}`,
  };
}

interface Cargado<T> {
  clave: string;
  datos: T;
  error: string | null;
}

export type ColaState = ReturnType<typeof useCola>;
