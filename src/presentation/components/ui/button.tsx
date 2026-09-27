import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/presentation/lib/cn";
import { Spinner } from "./spinner";

export type Variante = "primario" | "estructura" | "secundario" | "peligro" | "fantasma";

const VARIANTES: Record<Variante, string> = {
  // 10 %: llamado a la acción principal
  primario: "bg-esmeralda border border-esmeralda text-white hover:bg-[#0ea371]",
  // 30 %: acción estructural
  estructura: "bg-cerceta border border-cerceta text-white hover:bg-cerceta-profundo",
  secundario: "bg-superficie text-cerceta-oscuro border border-cerceta hover:bg-aqua-suave",
  peligro: "bg-rojo border border-rojo text-white hover:bg-peligro",
  fantasma: "bg-transparent text-tinta hover:bg-neutro",
};

const TAMANOS = {
  md: "min-h-12 px-4 text-sm",
  sm: "min-h-9 px-3 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function claseBoton(variante: Variante = "primario", tamano: keyof typeof TAMANOS = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-55",
    TAMANOS[tamano],
    VARIANTES[variante],
    extra,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
  tamano?: keyof typeof TAMANOS;
  icono?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variante = "primario", cargando = false, tamano = "md", icono, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={claseBoton(variante, tamano, className)}
      {...props}
    >
      {cargando ? <Spinner className="size-4" /> : icono}
      {children}
    </button>
  );
});

/** Enlace con apariencia de botón (navegación). */
export function BotonEnlace({
  href,
  variante = "primario",
  tamano = "md",
  icono,
  className,
  children,
}: {
  href: string;
  variante?: Variante;
  tamano?: keyof typeof TAMANOS;
  icono?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={claseBoton(variante, tamano, className)}>
      {icono}
      {children}
    </Link>
  );
}
