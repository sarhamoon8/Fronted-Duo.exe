"use client";

import { useEffect, useState } from "react";
import { TicketCheck } from "lucide-react";
import { cn } from "@/presentation/lib/cn";

const LINEA_1 = "Bienvenido a FilaCero,";
const LINEA_2_PREFIJO = "donde transformamos la espera en";
const LINEA_2_DESTACADO = "tranquilidad.";

// Tiempos (ms) configurados para que fluya como una conversación
const RETRASO_LINEA_1 = 600;
const RETRASO_LINEA_2 = 2200; 
const RETRASO_PUNTOS = 4000;
const DURACION_MS = 5500; // Tiempo antes de empezar a desvanecer todo
const SALIDA_MS = 800; // Duración del desvanecimiento final

let yaMostrada = false;

export function Presentacion() {
  const [fase, setFase] = useState<"visible" | "saliendo" | "oculta">(() => (yaMostrada ? "oculta" : "visible"));
  const [animarEntrada, setAnimarEntrada] = useState(false);

  useEffect(() => {
    if (fase !== "visible") return;
    yaMostrada = true;
    document.body.style.overflow = "hidden";

    // Un pequeñísimo retraso para que el DOM inicial (opacidad 0) se dibuje
    // y la transición hacia la opacidad 1 se ejecute suavemente.
    const tEntrada = setTimeout(() => setAnimarEntrada(true), 50);

    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tSalida = setTimeout(() => setFase("saliendo"), reducido ? 1500 : DURACION_MS);
    
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") setFase("saliendo");
    };
    
    window.addEventListener("keydown", tecla);
    return () => {
      clearTimeout(tEntrada);
      clearTimeout(tSalida);
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = "";
    };
  }, [fase]);

  useEffect(() => {
    if (fase !== "saliendo") return;
    const t = setTimeout(() => setFase("oculta"), SALIDA_MS);
    return () => clearTimeout(t);
  }, [fase]);

  if (fase === "oculta") return null;

  // Clases compartidas para el efecto de aparición (fade-in + slide-up + unblur)
  const clasesTransicion = cn(
    "transition-all duration-[1200ms] ease-out",
    animarEntrada ? "opacity-100 translate-y-0 blur-none" : "opacity-0 translate-y-4 blur-[4px]"
  );

  return (
    <div
      role="dialog"
      aria-label="Bienvenida a FilaCero"
      onClick={() => setFase("saliendo")}
      className={cn(
        "fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-cerceta-oscuro px-6 text-center text-white",
        // Transición de salida global de la pantalla
        "transition-opacity duration-[800ms] ease-in-out",
        fase === "saliendo" ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <span aria-hidden="true" className="absolute size-[520px] rounded-full bg-cerceta/40 blur-3xl" />
      <span aria-hidden="true" className="absolute -bottom-40 -right-40 size-[420px] rounded-full bg-esmeralda/20 blur-3xl transition-opacity duration-1000 delay-1000" />

      <div className="relative flex max-w-3xl flex-col items-center gap-8">
        <span aria-hidden="true" className={cn(
          "flex size-20 items-center justify-center rounded-2xl bg-white text-cerceta-oscuro shadow-tarjeta sm:size-24",
          "transition-all duration-1000 ease-out",
          animarEntrada ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}>
          <TicketCheck className="size-10 sm:size-12" strokeWidth={1.75} />
        </span>

        <p className="flex flex-col items-center gap-3">
          <span
            className={cn("text-4xl font-semibold leading-tight tracking-tight sm:text-6xl", clasesTransicion)}
            style={{ transitionDelay: `${RETRASO_LINEA_1}ms` }}
          >
            {LINEA_1}
          </span>
          <span
            className={cn("mt-2 text-2xl font-normal text-white/90 sm:text-4xl", clasesTransicion)}
            style={{ transitionDelay: `${RETRASO_LINEA_2}ms` }}
          >
            {LINEA_2_PREFIJO} <span className="font-medium text-esmeralda">{LINEA_2_DESTACADO}</span>
          </span>
        </p>

        {/* Puntos animándose uno por uno */}
        <span aria-hidden="true" className="mt-4 flex gap-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span 
              key={i} 
              className={cn(
                "size-2.5 rounded-full bg-esmeralda",
                "transition-all duration-700 ease-out",
                animarEntrada ? "opacity-100 scale-100" : "opacity-0 scale-50"
              )} 
              style={{ transitionDelay: `${RETRASO_PUNTOS + i * 200}ms` }} 
            />
          ))}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setFase("saliendo")}
        className={cn(
          "absolute bottom-6 right-6 rounded-lg px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-300 delay-[3000ms]",
          animarEntrada ? "opacity-100" : "opacity-0"
        )}
      >
        Saltar
      </button>
    </div>
  );
}