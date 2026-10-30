"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mensajeDeError } from "@/core/domain/errors";

interface Resultado<T> {
  clave: string;
  datos: T | null;
  error: string | null;
}

/**
 * Carga un recurso del backend y lo recarga cuando cambia `clave` (o
 * periódicamente si se indica `intervaloMs`).
 * "Cargando" se deriva comparando la clave pedida con la última resuelta, así
 * ningún setState ocurre de forma síncrona dentro de un efecto.
 */
export function useRecurso<T>(
  clave: string,
  cargar: () => Promise<T>,
  opciones: { activo?: boolean; intervaloMs?: number } = {},
) {
  const { activo = true, intervaloMs } = opciones;
  const [version, setVersion] = useState(0);
  const [resultado, setResultado] = useState<Resultado<T> | null>(null);
  const cargarRef = useRef(cargar);
  useEffect(() => {
    cargarRef.current = cargar;
  });

  const claveCompleta = `${clave}:${version}`;

  useEffect(() => {
    if (!activo) return;
    let vigente = true;
    const ejecutar = () =>
      cargarRef
        .current()
        .then((datos) => vigente && setResultado({ clave: claveCompleta, datos, error: null }))
        .catch((e) => vigente && setResultado((previo) => ({ clave: claveCompleta, datos: previo?.datos ?? null, error: mensajeDeError(e) })));
    void ejecutar();
    const temporizador = intervaloMs ? setInterval(() => void ejecutar(), intervaloMs) : null;
    return () => {
      vigente = false;
      if (temporizador) clearInterval(temporizador);
    };
  }, [activo, claveCompleta, intervaloMs]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return {
    datos: resultado?.datos ?? null,
    error: resultado?.error ?? null,
    cargando: activo && resultado?.clave !== claveCompleta,
    recargar,
  };
}
