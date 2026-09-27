"use client";

import { cn } from "@/presentation/lib/cn";

function etiquetaHora(h: number) {
  if (h === 12) return "12 p. m.";
  return h < 12 ? `${h} a. m.` : `${h - 12} p. m.`;
}

/**
 * Barras verticales de una sola serie (turnos por hora). La hora pico se
 * resalta en esmeralda; el resto va en cerceta. Incluye tabla accesible.
 */
export function GraficoDemanda({ datos }: { datos: { hora: number; turnos: number }[] }) {
  const max = Math.max(1, ...datos.map((d) => d.turnos));
  const pico = datos.reduce((a, b) => (b.turnos > a.turnos ? b : a), datos[0]!);

  return (
    <figure>
      <div className="flex h-56 items-end gap-1.5 border-b border-borde sm:gap-3" aria-hidden="true">
        {datos.map((d) => {
          const alto = (d.turnos / max) * 100;
          const esPico = d.turnos > 0 && d.hora === pico.hora;
          return (
            <div key={d.hora} className="group relative flex h-full flex-1 flex-col justify-end">
              <span className="mb-1 text-center text-xs text-tinta-tenue">{d.turnos > 0 ? d.turnos : ""}</span>
              <div
                className={cn("w-full rounded-t-[4px] transition-opacity group-hover:opacity-85", esPico ? "bg-esmeralda" : "bg-cerceta-profundo", d.turnos === 0 && "bg-borde")}
                style={{ height: `${Math.max(alto, d.turnos ? 4 : 1.5)}%` }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-tinta px-2 py-1 text-xs text-white group-hover:block">
                {etiquetaHora(d.hora)}: {d.turnos} turnos
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-3" aria-hidden="true">
        {datos.map((d) => (
          <span key={d.hora} className="flex-1 text-center text-[10px] text-tinta-tenue sm:text-xs">{etiquetaHora(d.hora)}</span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Turnos emitidos por hora</caption>
        <thead><tr><th scope="col">Hora</th><th scope="col">Turnos</th></tr></thead>
        <tbody>
          {datos.map((d) => (
            <tr key={d.hora}><td>{etiquetaHora(d.hora)}</td><td>{d.turnos}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
