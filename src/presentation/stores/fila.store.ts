"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Preferencias del puesto de atención (se recuerdan en esta pestaña). */
interface FilaState {
  entidadId: string;
  servicioId: string;
  autoActualizar: boolean;
  setEntidad: (id: string) => void;
  setServicio: (id: string) => void;
  setAutoActualizar: (v: boolean) => void;
}

export const useFilaStore = create<FilaState>()(
  persist(
    (set) => ({
      entidadId: "",
      servicioId: "",
      autoActualizar: true,
      setEntidad: (entidadId) => set({ entidadId, servicioId: "" }),
      setServicio: (servicioId) => set({ servicioId }),
      setAutoActualizar: (autoActualizar) => set({ autoActualizar }),
    }),
    { name: "filacero-fila", storage: createJSONStorage(() => sessionStorage) },
  ),
);
