import { Headset } from "lucide-react";

/** "¿Necesitas ayuda? Línea gratuita …" que cierra las pantallas de acceso (web: centrado; móvil: a la izquierda). */
export function AyudaContacto() {
  return (
    <p className="mt-6 flex items-center justify-start gap-3 px-3 text-[13px] text-tinta-suave lg:justify-center">
      <Headset className="size-5 shrink-0 text-cerceta-profundo" aria-hidden="true" />
      <span className="flex flex-col leading-snug">
        <span className="font-semibold text-titulo">¿Necesitas ayuda?</span>
        <span className="text-cerceta-profundo">Línea gratuita 01 8000 123 456</span>
      </span>
    </p>
  );
}
