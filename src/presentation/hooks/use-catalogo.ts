"use client";

import { useCallback, useEffect, useState } from "react";
import type { EntidadMedica, PuntoDispensacion, Servicio } from "@/core/domain/entities/catalogo";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";

interface Cargado<T> {
  clave: string;
  datos: T;
  error: string | null;
}

/**
 * Carga entidades médicas y, al elegir una, sus servicios y sus puntos de
 * dispensación (sedes físicas).
 * El estado "cargando" se deriva comparando la clave pedida con la última
 * clave resuelta, así ningún setState ocurre de forma síncrona en un efecto.
 */
export function useCatalogo(entidadId: string) {
  const [version, setVersion] = useState(0);
  const [entidades, setEntidades] = useState<Cargado<EntidadMedica[]> | null>(null);
  const [servicios, setServicios] = useState<Cargado<Servicio[]> | null>(null);
  const [puntos, setPuntos] = useState<Cargado<PuntoDispensacion[]> | null>(null);

  useEffect(() => {
    let vigente = true;
    const clave = String(version);
    casosDeUso.listarEntidades
      .ejecutar()
      .then((datos) => vigente && setEntidades({ clave, datos, error: null }))
      .catch((e) => vigente && setEntidades({ clave, datos: [], error: mensajeDeError(e) }));
    return () => {
      vigente = false;
    };
  }, [version]);

  const claveDependiente = entidadId ? `${entidadId}:${version}` : "";

  useEffect(() => {
    if (!entidadId) return;
    let vigente = true;
    casosDeUso.listarServicios
      .ejecutar(entidadId)
      .then((datos) => vigente && setServicios({ clave: claveDependiente, datos, error: null }))
      .catch((e) => vigente && setServicios({ clave: claveDependiente, datos: [], error: mensajeDeError(e) }));
    return () => {
      vigente = false;
    };
  }, [entidadId, claveDependiente]);

  useEffect(() => {
    if (!entidadId) return;
    let vigente = true;
    casosDeUso.listarPuntos
      .ejecutar(entidadId)
      .then((datos) => vigente && setPuntos({ clave: claveDependiente, datos, error: null }))
      .catch((e) => vigente && setPuntos({ clave: claveDependiente, datos: [], error: mensajeDeError(e) }));
    return () => {
      vigente = false;
    };
  }, [entidadId, claveDependiente]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  const serviciosVigentes = entidadId && servicios?.clave === claveDependiente ? servicios : null;
  const puntosVigentes = entidadId && puntos?.clave === claveDependiente ? puntos : null;

  return {
    entidades: entidades?.datos ?? [],
    servicios: serviciosVigentes?.datos ?? [],
    puntos: puntosVigentes?.datos ?? [],
    cargandoEntidades: entidades?.clave !== String(version),
    cargandoServicios: !!entidadId && !serviciosVigentes,
    cargandoPuntos: !!entidadId && !puntosVigentes,
    error: entidades?.error ?? serviciosVigentes?.error ?? puntosVigentes?.error ?? null,
    recargar,
  };
}
