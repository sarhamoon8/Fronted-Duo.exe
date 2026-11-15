import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/presentation/lib/cn";

/** Casilla con su texto; toda la fila es clicable y mide al menos 44 px de alto (táctil). */
export const Checkbox = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & { children: ReactNode }
>(function Checkbox({ children, className, ...props }, ref) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-start gap-2.5 py-2 text-[13px] leading-snug text-tinta-suave", className)}>
      <input ref={ref} type="checkbox" className="mt-px size-[18px] shrink-0 cursor-pointer accent-cerceta-profundo" {...props} />
      <span>{children}</span>
    </label>
  );
});
