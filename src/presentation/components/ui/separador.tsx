/** Línea divisoria con una palabra centrada (p. ej. entre "Iniciar sesión" y "Continuar con Google"). */
export function Separador({ texto = "o" }: { texto?: string }) {
  return (
    <div className="relative flex items-center py-1" role="separator" aria-label={texto}>
      <span aria-hidden="true" className="h-px w-full bg-borde" />
      <span
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 rounded-full border border-borde bg-superficie px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-tinta-tenue"
      >
        {texto}
      </span>
    </div>
  );
}
