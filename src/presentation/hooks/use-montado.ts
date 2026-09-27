"use client";

import { useSyncExternalStore } from "react";

const suscribirNada = () => () => {};

/** true solo en el cliente: evita desajustes de hidratación con localStorage. */
export function useMontado(): boolean {
  return useSyncExternalStore(suscribirNada, () => true, () => false);
}
