"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { EstadoTurno, Turno } from "@/core/domain/entities/turno";

/**
 * El backend no expone un "GET mis turnos" para el paciente: el turno y su
 * posición solo llegan en la respuesta de POST /turnos y PATCH /cancelar.
 * Por eso guardamos localmente los turnos del usuario (por id de usuario),
 * junto con el nombre del servicio y la entidad para mostrarlos.
 */
export interface TurnoGuardado {
  id: string;
  usuarioId: string;
  servicioId: string;
  servicioNombre: string;
  entidadNombre: string;
  estado: EstadoTurno;
  posicion: number | null;
  creadoEn: string; // ISO (serializable)
  actualizadoEn: string; // ISO: última respuesta del backend
}

interface TurnosState {
  porUsuario: Record<string, TurnoGuardado[]>;
  guardar: (turno: Turno, contexto: { servicioNombre: string; entidadNombre: string }) => void;
  actualizar: (turno: Turno) => void;
  quitar: (usuarioId: string, turnoId: string) => void;
}

function aGuardado(t: Turno, ctx: { servicioNombre: string; entidadNombre: string }): TurnoGuardado {
  return {
    id: t.id,
    usuarioId: t.usuarioId,
    servicioId: t.servicioId,
    estado: t.estado,
    posicion: t.posicion,
    creadoEn: t.creadoEn.toISOString(),
    actualizadoEn: new Date().toISOString(),
    ...ctx,
  };
}

export const useTurnosStore = create<TurnosState>()(
  persist(
    (set) => ({
      porUsuario: {},
      guardar: (turno, ctx) =>
        set((s) => {
          const lista = s.porUsuario[turno.usuarioId] ?? [];
          return {
            porUsuario: {
              ...s.porUsuario,
              [turno.usuarioId]: [aGuardado(turno, ctx), ...lista.filter((t) => t.id !== turno.id)],
            },
          };
        }),
      actualizar: (turno) =>
        set((s) => {
          const lista = s.porUsuario[turno.usuarioId] ?? [];
          return {
            porUsuario: {
              ...s.porUsuario,
              [turno.usuarioId]: lista.map((t) =>
                t.id === turno.id
                  ? { ...t, estado: turno.estado, posicion: turno.posicion, actualizadoEn: new Date().toISOString() }
                  : t,
              ),
            },
          };
        }),
      quitar: (usuarioId, turnoId) =>
        set((s) => ({
          porUsuario: {
            ...s.porUsuario,
            [usuarioId]: (s.porUsuario[usuarioId] ?? []).filter((t) => t.id !== turnoId),
          },
        })),
    }),
    {
      name: "filacero-turnos",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

const VACIO: TurnoGuardado[] = [];
export function useMisTurnos(usuarioId: string | undefined): TurnoGuardado[] {
  return useTurnosStore((s) => (usuarioId ? (s.porUsuario[usuarioId] ?? VACIO) : VACIO));
}

/** Turno activo más reciente (PENDIENTE o EN_CURSO) del usuario. */
export function turnoActivoDe(turnos: TurnoGuardado[]): TurnoGuardado | null {
  return turnos.find((t) => t.estado === "PENDIENTE" || t.estado === "EN_CURSO") ?? null;
}
