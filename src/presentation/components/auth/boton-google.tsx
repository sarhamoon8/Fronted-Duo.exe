"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/presentation/lib/cn";

interface RespuestaGoogle {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (r: RespuestaGoogle) => void }): void;
          renderButton(elemento: HTMLElement, opciones: Record<string, unknown>): void;
        };
      };
    };
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";
let cargaGis: Promise<void> | null = null;

/** Carga (una sola vez) la librería de Google Identity Services. */
function cargarGis(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  cargaGis ??= new Promise<void>((resolver, rechazar) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolver();
    script.onerror = () => {
      cargaGis = null;
      rechazar(new Error("No se pudo cargar Google"));
    };
    document.head.appendChild(script);
  });
  return cargaGis;
}

/** Logotipo de Google (colores de marca; es una marca registrada, se usa tal cual). */
function IconoGoogle() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.27-2.09 3.56-5.17 3.56-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.64H1.28a12 12 0 0 0 0 10.72l3.99-3.09z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.64l3.99 3.09C6.22 6.88 8.87 4.77 12 4.77z" />
    </svg>
  );
}

const CLASE_BOTON =
  "inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-borde bg-superficie px-4 text-sm font-semibold text-tinta " +
  "transition duration-150 hover:bg-neutro active:scale-[0.97] disabled:cursor-wait disabled:opacity-60";

/**
 * "Continuar con Google". Con GOOGLE_CLIENT_ID configurado muestra el botón
 * oficial de Google Identity Services y entrega el token de identidad en
 * `onCredential`. Sin Client ID muestra un botón equivalente que avisa por
 * `onNoDisponible` (la app sigue funcionando con correo y contraseña).
 */
export function BotonGoogle({
  onCredential,
  onNoDisponible,
  className,
}: {
  onCredential: (credential: string) => void;
  onNoDisponible: () => void;
  className?: string;
}) {
  // undefined = consultando la configuración; null = sin configurar.
  const [clientId, setClientId] = useState<string | null | undefined>(undefined);
  const contenedor = useRef<HTMLDivElement>(null);
  const alRecibir = useRef(onCredential);
  useEffect(() => {
    alRecibir.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let activo = true;
    fetch("/api/auth/google/config")
      .then((r) => (r.ok ? (r.json() as Promise<{ clientId: string | null }>) : { clientId: null }))
      .then((d) => activo && setClientId(d.clientId))
      .catch(() => activo && setClientId(null));
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!clientId) return;
    let activo = true;
    cargarGis()
      .then(() => {
        const el = contenedor.current;
        if (!activo || !el || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (r) => alRecibir.current(r.credential),
        });
        window.google.accounts.id.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          locale: "es",
          width: Math.min(400, Math.max(200, el.offsetWidth)),
        });
      })
      .catch(() => activo && setClientId(null));
    return () => {
      activo = false;
    };
  }, [clientId]);

  if (clientId) {
    return <div ref={contenedor} role="group" aria-label="Continuar con Google" className={cn("flex min-h-12 w-full justify-center", className)} />;
  }

  return (
    <button type="button" disabled={clientId === undefined} onClick={onNoDisponible} className={cn(CLASE_BOTON, className)}>
      <IconoGoogle />
      Continuar con Google
    </button>
  );
}
