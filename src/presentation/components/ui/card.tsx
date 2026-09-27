"use client";

import { createContext, useContext, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/presentation/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6", className)}
      {...props}
    />
  );
}

/** Título de tarjeta (20 px regular) + subtítulo (13 px) a la izquierda, acciones a la derecha. */
export function CardTitulo({
  children,
  id,
  descripcion,
  acciones,
}: {
  children: ReactNode;
  id?: string;
  descripcion?: ReactNode;
  acciones?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-[min(100%,15rem)] flex-1">
        <h2 id={id} className="text-lg text-titulo sm:text-xl">
          {children}
        </h2>
        {descripcion && <p className="mt-1 text-[13px] text-tinta-tenue">{descripcion}</p>}
      </div>
      {acciones}
    </div>
  );
}

/**
 * Antetítulo de la página actual. <Pagina> lo publica y el encabezado lo
 * muestra solo en móvil, donde no hay barra superior con título.
 */
export const AntetituloContext = createContext<string | null>(null);

/** Encabezado del contenido: título grande (28 px regular) + subtítulo + acciones. */
export function EncabezadoPagina({
  titulo,
  descripcion,
  acciones,
  antetitulo,
  className = "mb-6",
}: {
  className?: string;
  titulo: string;
  descripcion?: ReactNode;
  acciones?: ReactNode;
  /** Sobrescribe el antetítulo móvil (p. ej. la fecha en el inicio). */
  antetitulo?: string;
}) {
  const deContexto = useContext(AntetituloContext);
  const ante = antetitulo ?? deContexto;
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-[min(100%,16rem)] flex-1">
        {ante && <p className="mb-1 text-[11px] font-bold uppercase text-esmeralda-profundo lg:hidden">{ante}</p>}
        <h1 className="text-[26px] leading-tight text-titulo sm:text-[28px]">{titulo}</h1>
        {descripcion && <p className="mt-1.5 text-sm text-tinta-tenue">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}

/** Tarjeta de indicador (KPI) con icono de color arriba a la derecha. */
export function Indicador({
  etiqueta,
  valor,
  detalle,
  icono,
  tono = "aqua",
  demo = false,
}: {
  demo?: boolean;
  etiqueta: string;
  valor: ReactNode;
  detalle?: ReactNode;
  icono: ReactNode;
  tono?: "aqua" | "menta" | "azul" | "ambar";
}) {
  const tonos = {
    aqua: "bg-aqua text-cerceta-oscuro",
    menta: "bg-menta text-esmeralda-profundo",
    azul: "bg-azul-fondo text-azul",
    ambar: "bg-ambar-fondo text-ambar-vivo",
  };
  return (
    <div className="rounded-2xl border border-borde bg-superficie p-5 shadow-tarjeta">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] text-tinta-tenue">{etiqueta}</p>
        <span aria-hidden="true" className={cn("flex size-8 items-center justify-center rounded-lg", tonos[tono])}>
          {icono}
        </span>
      </div>
      <p className="mt-3 text-3xl text-titulo">{valor}</p>
      {detalle && <p className="mt-2 text-xs text-tinta-tenue">{detalle}</p>}
      {demo && (
        <p className="mt-2">
          <MarcaDemo />
        </p>
      )}
    </div>
  );
}

/** Píldora de estado (En espera, Disponible, Operando…): 28 px de alto, 12 px negrita. */
export function Pildora({
  children,
  tono = "menta",
  icono,
  className,
}: {
  children: ReactNode;
  tono?: "menta" | "aqua" | "ambar" | "rojo" | "neutro" | "borde";
  icono?: ReactNode;
  className?: string;
}) {
  const tonos = {
    menta: "bg-menta text-esmeralda-profundo",
    aqua: "bg-aqua text-cerceta-oscuro",
    ambar: "bg-ambar-fondo text-ambar-vivo",
    rojo: "bg-rojo-fondo text-peligro",
    neutro: "bg-neutro text-tinta-tenue",
    borde: "bg-superficie text-cerceta-oscuro ring-1 ring-cerceta/40",
  };
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-bold", tonos[tono], className)}>
      {icono}
      {children}
    </span>
  );
}

/** Marca discreta para secciones que aún usan datos de ejemplo (sin endpoint en el backend). */
export function MarcaDemo() {
  return (
    <span
      title="El backend aún no expone estos datos: se muestran datos de ejemplo."
      className="inline-flex items-center rounded-full border border-dashed border-borde-fuerte px-2 py-0.5 text-[11px] font-medium text-tinta-tenue"
    >
      Datos de ejemplo
    </span>
  );
}
