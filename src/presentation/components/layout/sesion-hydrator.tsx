"use client";

import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import type { Sesion } from "@/core/domain/entities/sesion";
import { registrarManejadorSesionExpirada } from "@/infrastructure/http/internal-client";
import { useSesionStore } from "@/presentation/stores/sesion.store";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Puente servidor → Zustand: el layout protegido resuelve la sesión leyendo
 * la cookie httpOnly y este componente la vuelca al store global. También
 * registra qué hacer cuando el cliente interno recibe un 401.
 */
export function SesionHydrator({ sesion }: { sesion: Sesion }) {
  const router = useRouter();
  const establecer = useSesionStore((s) => s.establecer);
  const limpiar = useSesionStore((s) => s.limpiar);

  useIsoLayoutEffect(() => {
    establecer(sesion);
  }, [sesion, establecer]);

  useEffect(() => {
    registrarManejadorSesionExpirada(() => {
      limpiar();
      router.replace("/login?expirada=1");
      router.refresh();
    });
  }, [limpiar, router]);

  return null;
}
