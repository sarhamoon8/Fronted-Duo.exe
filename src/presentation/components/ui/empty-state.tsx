import type { ReactNode } from "react";

export function EstadoVacio({ titulo, children, icono }: { titulo: string; children?: ReactNode; icono?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-borde-fuerte bg-neutro-2 px-6 py-10 text-center">
      {icono && (
        <span aria-hidden="true" className="mb-3 flex size-10 items-center justify-center rounded-full bg-aqua text-cerceta-profundo">
          {icono}
        </span>
      )}
      <p className="font-semibold text-tinta">{titulo}</p>
      {children && <div className="mt-1 text-sm text-tinta-tenue">{children}</div>}
    </div>
  );
}
