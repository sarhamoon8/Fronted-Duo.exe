"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Preferencias del puesto de atención (se recuerdan en esta pestaña). */
interface FilaState {
  entidadId: string;
  puntoId: string;
  servicioId: string;
  ventanillaId: string;
  autoActualizar: boolean;
  setEntidad: (id: string) => void;
  setPunto: (id: string) => void;
  setServicio: (id: string) => void;
  setVentanilla: (id: string) => void;
  setAutoActualizar: (v: boolean) => void;
}

export const useFilaStore = create<FilaState>()(
  persist(
    (set) => ({
      entidadId: "",
      puntoId: "",
      servicioId: "",
      ventanillaId: "",
      autoActualizar: true,
      setEntidad: (entidadId) => set({ entidadId, puntoId: "", servicioId: "", ventanillaId: "" }),
      setPunto: (puntoId) => set({ puntoId, ventanillaId: "" }),
      setServicio: (servicioId) => set({ servicioId }),
      setVentanilla: (ventanillaId) => set({ ventanillaId }),
      setAutoActualizar: (autoActualizar) => set({ autoActualizar }),
    }),
    { name: "filacero-fila", storage: createJSONStorage(() => sessionStorage) },
  ),
);
