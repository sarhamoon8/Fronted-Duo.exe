"use client";

import { useEffect, useState } from "react";
import { TicketCheck } from "lucide-react";
import { cn } from "@/presentation/lib/cn";

const LINEA_1 = ["Bienvenido", "a", "FilaCero,"];
const LINEA_2 = ["donde", "transformamos", "la", "espera", "en", "tranquilidad."];
const DURACION_MS = 8000;
const SALIDA_MS = 300;

// Solo se muestra una vez por carga de la app: al volver a "/" desde /login no se repite.
let yaMostrada = false;

/** Pantalla de bienvenida animada que cubre la portada antes de mostrarla. */
export function Presentacion() {
  const [fase, setFase] = useState<"visible" | "saliendo" | "oculta">(() => (yaMostrada ? "oculta" : "visible"));

  useEffect(() => {
    if (fase !== "visible") return;
    yaMostrada = true;
    document.body.style.overflow = "hidden";
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setFase("saliendo"), reducido ? 2000 : DURACION_MS);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") setFase("saliendo");
    };
    window.addEventListener("keydown", tecla);
    return () => {
      clearTimeout(t);
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

  let indice = 0;
  const palabra = (p: string, resaltada = false) => (
    <span
      key={p}
      className={cn("intro-palabra", resaltada && "text-menta")}
      style={{ animationDelay: `${600 + indice++ * 140}ms` }}
    >
      {p}
    </span>
  );

  return (
    <div
      role="dialog"
      aria-label="Bienvenida a FilaCero"
      onClick={() => setFase("saliendo")}
      className={cn(
        "fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-cerceta-oscuro px-6 text-center text-white",
        fase === "saliendo" && "intro-salida",
      )}
    >
      <span aria-hidden="true" className="intro-halo absolute size-[520px] rounded-full bg-cerceta/40 blur-3xl" />
      <span aria-hidden="true" className="intro-halo absolute -bottom-40 -right-40 size-[420px] rounded-full bg-esmeralda/20 blur-3xl [animation-delay:1.5s]" />

      <div className="relative flex max-w-3xl flex-col items-center gap-8">
        <span aria-hidden="true" className="intro-logo flex size-20 items-center justify-center rounded-2xl bg-white text-cerceta-oscuro shadow-tarjeta sm:size-24">
          <TicketCheck className="size-10 sm:size-12" strokeWidth={1.75} />
        </span>

        <p className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          <span className="flex flex-wrap justify-center gap-x-[0.3em]">{LINEA_1.map((p) => palabra(p))}</span>
          <span className="mt-2 flex flex-wrap justify-center gap-x-[0.3em] text-2xl font-normal text-white/90 sm:text-4xl">
            {LINEA_2.map((p) => palabra(p, p === "tranquilidad."))}
          </span>
        </p>

        {/* La "fila" de puntos se vacía hasta quedar en cero. */}
        <span aria-hidden="true" className="flex gap-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="intro-punto size-2.5 rounded-full bg-menta" style={{ animationDelay: `${2300 + i * 220}ms` }} />
          ))}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setFase("saliendo")}
        className="absolute bottom-6 right-6 rounded-lg px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
      >
        Saltar
      </button>
    </div>
  );
}
