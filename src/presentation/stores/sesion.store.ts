"use client";

import { create } from "zustand";
import type { Sesion } from "@/core/domain/entities/sesion";

type EstadoSesion = "desconocido" | "autenticado" | "anonimo";

interface SesionState {
  usuario: Sesion | null;
  estado: EstadoSesion;
  establecer: (usuario: Sesion) => void;
  limpiar: () => void;
}

/**
 * Estado global de la sesión. No persiste nada en el navegador: la fuente
 * de verdad es la cookie httpOnly, y el layout protegido hidrata este store
 * con la sesión que resolvió el servidor.
 */
export const useSesionStore = create<SesionState>()((set) => ({
  usuario: null,
  estado: "desconocido",
  establecer: (usuario) => set({ usuario, estado: "autenticado" }),
  limpiar: () => set({ usuario: null, estado: "anonimo" }),
}));
