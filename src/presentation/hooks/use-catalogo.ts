"use client";

import { useCallback, useEffect, useState } from "react";
import type { EntidadMedica, Servicio } from "@/core/domain/entities/catalogo";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";

interface Cargado<T> {
  clave: string;
  datos: T;
  error: string | null;
}

/**
 * Carga entidades médicas y, al elegir una, sus servicios.
 * El estado "cargando" se deriva comparando la clave pedida con la última
 * clave resuelta, así ningún setState ocurre de forma síncrona en un efecto.
 */
export function useCatalogo(entidadId: string) {
  const [version, setVersion] = useState(0);
  const [entidades, setEntidades] = useState<Cargado<EntidadMedica[]> | null>(null);
  const [servicios, setServicios] = useState<Cargado<Servicio[]> | null>(null);

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

  const claveServicios = entidadId ? `${entidadId}:${version}` : "";
  useEffect(() => {
    if (!entidadId) return;
    let vigente = true;
    casosDeUso.listarServicios
      .ejecutar(entidadId)
      .then((datos) => vigente && setServicios({ clave: claveServicios, datos, error: null }))
      .catch((e) => vigente && setServicios({ clave: claveServicios, datos: [], error: mensajeDeError(e) }));
    return () => {
      vigente = false;
    };
  }, [entidadId, claveServicios]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  const serviciosVigentes = entidadId && servicios?.clave === claveServicios ? servicios : null;

  return {
    entidades: entidades?.datos ?? [],
    servicios: serviciosVigentes?.datos ?? [],
    cargandoEntidades: entidades?.clave !== String(version),
    cargandoServicios: !!entidadId && !serviciosVigentes,
    error: entidades?.error ?? serviciosVigentes?.error ?? null,
    recargar,
  };
}
