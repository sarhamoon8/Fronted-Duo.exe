import { TicketCheck } from "lucide-react";
import { cn } from "@/presentation/lib/cn";

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
