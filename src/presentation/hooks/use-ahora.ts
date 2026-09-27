"use client";

import { useEffect, useState } from "react";

/** Marca de tiempo que se refresca cada `ms` (para "hace X min"). */
export function useAhora(ms = 15_000): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setAhora(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return ahora;
}
