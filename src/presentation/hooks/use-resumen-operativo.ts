"use client";

import { useEffect, useState } from "react";
import type { EntidadMedica, Servicio } from "@/core/domain/entities/catalogo";
import type { Turno } from "@/core/domain/entities/turno";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { esHoy, horaBogota, minutosDesde } from "@/presentation/lib/cn";

export const META_ESPERA_MIN = 30;
export const HORAS_JORNADA = Array.from({ length: 12 }, (_, i) => 7 + i); // 7 a. m. – 6 p. m.

export interface FilaServicio {
  nombre: string;
  sedes: number;
  enFila: number;
  esperaMin: number | null;
}

export interface ResumenOperativo {
  entidades: EntidadMedica[];
  emitidosHoy: number;
  atendidosHoy: number;
  esperaPromedio: number | null;
  nivelServicio: number | null;
  demandaPorHora: { hora: number; turnos: number }[];
  porServicio: FilaServicio[];
}

/**
 * Indicadores calculados en el cliente a partir de los endpoints existentes:
 * GET /entidades-medicas, GET /servicios y GET /turnos/servicio/:id por servicio.
 */
export function calcularResumen(entidades: EntidadMedica[], servicios: Servicio[], turnosPorServicio: Turno[][], ahora = Date.now()): ResumenOperativo {
  const todos = turnosPorServicio.flat();
  const hoy = todos.filter((t) => esHoy(t.creadoEn));
  const atendidosHoy = hoy.filter((t) => t.estado === "ATENDIDO").length;
  const pendientes = todos.filter((t) => t.estado === "PENDIENTE");
  const promedio = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

  const demandaPorHora = HORAS_JORNADA.map((hora) => ({
    hora,
    turnos: hoy.filter((t) => horaBogota(t.creadoEn) === hora).length,
  }));

  // Agrupa por nombre de servicio (un mismo servicio puede existir en varias sedes).
  const grupos = new Map<string, { sedes: Set<string>; pendientes: Turno[] }>();
  servicios.forEach((s, i) => {
    const clave = s.nombre.trim();
    const g = grupos.get(clave) ?? { sedes: new Set(), pendientes: [] };
    g.sedes.add(s.entidadId);
    g.pendientes.push(...(turnosPorServicio[i] ?? []).filter((t) => t.estado === "PENDIENTE"));
    grupos.set(clave, g);
  });
  const porServicio = [...grupos.entries()]
    .map(([nombre, g]) => ({
      nombre,
      sedes: g.sedes.size,
      enFila: g.pendientes.length,
      esperaMin: promedio(g.pendientes.map((t) => minutosDesde(t.creadoEn, ahora))),
    }))
    .sort((a, b) => b.enFila - a.enFila);

  return {
    entidades,
    emitidosHoy: hoy.length,
    atendidosHoy,
    esperaPromedio: promedio(pendientes.map((t) => minutosDesde(t.creadoEn, ahora))),
    nivelServicio: hoy.length ? Math.round((atendidosHoy / hoy.length) * 1000) / 10 : null,
    demandaPorHora,
    porServicio,
  };
}

export function useResumenOperativo() {
  const [estado, setEstado] = useState<{ datos: ResumenOperativo | null; error: string | null; en: Date | null }>({
    datos: null,
    error: null,
    en: null,
  });

  useEffect(() => {
    let vigente = true;
    async function cargar() {
      const [entidades, servicios] = await Promise.all([
        casosDeUso.listarEntidades.ejecutar(),
        casosDeUso.listarServicios.ejecutar(),
      ]);
      const turnos = await Promise.all(
        servicios.map((s) => casosDeUso.consultarFila.ejecutar(s.id).then((r) => r.turnos)),
      );
      return calcularResumen(entidades, servicios, turnos);
    }
    const tick = () =>
      cargar()
        .then((datos) => vigente && setEstado({ datos, error: null, en: new Date() }))
        .catch((e) => vigente && setEstado((s) => ({ ...s, error: mensajeDeError(e) })));
    void tick();
    const id = window.setInterval(() => document.visibilityState === "visible" && void tick(), 30_000);
    return () => {
      vigente = false;
      window.clearInterval(id);
    };
  }, []);

  return estado;
}
