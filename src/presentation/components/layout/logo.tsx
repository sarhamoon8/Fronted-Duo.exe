import Image from "next/image";
import { TicketCheck } from "lucide-react";
import { cn } from "@/presentation/lib/cn";
import logoFilaCero from "../../../../public/filacero-logo.png";

/** Marca FilaCero: icono en caja blanca + nombre (+ lema en escritorio). */
export function Logo({ compacto = false, className }: { compacto?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center", compacto ? "gap-2.5" : "gap-3", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center rounded-xl bg-white text-cerceta-oscuro",
          compacto ? "size-[38px]" : "size-[42px]",
        )}
      >
        <TicketCheck className={compacto ? "size-[22px]" : "size-6"} strokeWidth={1.75} />
      </span>
      <span className="leading-tight">
        <span className={cn("block font-extrabold text-white", compacto ? "text-[19px]" : "text-xl")}>FilaCero</span>
        {!compacto && <span className="block text-[10px] font-semibold text-white/80">Salud sin filas</span>}
      </span>
    </span>
  );
}

/**
 * Logotipo a color completo (ícono + nombre en una sola imagen, fondo
 * blanco). Pensado para fondos claros: en los fondos cerceta oscuro de la
 * barra lateral y la bienvenida se sigue usando <Logo />, que es texto e
 * ícono en vivo y sí tiene buen contraste ahí.
 */
export function LogoCompleto({ className }: { className?: string }) {
  return (
    <Image
      src={logoFilaCero}
      alt="FilaCero"
      priority
      className={cn("h-auto w-44 sm:w-52", className)}
    />
  );
}
