"use client";

import { create } from "zustand";

/** Estado de la interfaz: hoja de perfil en móvil. */
interface UiState {
  perfilAbierto: boolean;
  abrirPerfil: () => void;
  cerrarPerfil: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  perfilAbierto: false,
  abrirPerfil: () => set({ perfilAbierto: true }),
  cerrarPerfil: () => set({ perfilAbierto: false }),
}));
