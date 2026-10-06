"use client";

import { useCallback, useEffect, useState } from "react";
import type { Turno } from "@/core/domain/entities/turno";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";

/** Turno real (GET /turnos/mis-turnos) con los nombres que el backend no denormaliza. */
export interface TurnoConNombres extends Turno {
  entidadNombre: string;
  servicioNombre: string;
}

interface Resultado {
  clave: string;
  turnos: TurnoConNombres[];
  error: string | null;
  actualizadoEn: number;
}

/**
 * Turnos reales del paciente autenticado, cruzados con el catálogo público
 * de servicios/entidades para mostrar nombres en vez de ids. Reemplaza el
 * antiguo store de Zustand en localStorage: ahora la fuente de verdad es
 * siempre el backend.
 *
 * "cargando" se deriva comparando la clave pedida con la última resuelta
 * (mismo patrón que useCatalogo), para no llamar setState de forma
 * síncrona dentro del efecto.
 */
export function useMisTurnos() {
  const [version, setVersion] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    let vigente = true;
    const clave = String(version);
    Promise.all([
      casosDeUso.misTurnos.ejecutar(),
      casosDeUso.listarEntidades.ejecutar(),
      casosDeUso.listarServicios.ejecutar(),
    ])
      .then(([misTurnos, entidades, servicios]) => {
        if (!vigente) return;
        const nombreEntidad = new Map(entidades.map((e) => [e.id, e.nombre]));
        const servicioPorId = new Map(servicios.map((s) => [s.id, s]));
        const turnos = misTurnos.map((t) => {
          const servicio = servicioPorId.get(t.servicioId);
          return {
            ...t,
            servicioNombre: servicio?.nombre ?? "Servicio",
            entidadNombre: (servicio && nombreEntidad.get(servicio.entidadId)) || "Sede",
          };
        });
        setResultado({ clave, turnos, error: null, actualizadoEn: Date.now() });
      })
      .catch((e) => {
        if (!vigente) return;
        setResultado({ clave, turnos: [], error: mensajeDeError(e), actualizadoEn: Date.now() });
      });
    return () => {
      vigente = false;
    };
  }, [version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  const vigente = resultado?.clave === String(version);
  return {
    turnos: vigente ? resultado!.turnos : [],
    cargando: !vigente,
    error: vigente ? resultado!.error : null,
    actualizadoEn: vigente ? resultado!.actualizadoEn : null,
    recargar,
  };
}
