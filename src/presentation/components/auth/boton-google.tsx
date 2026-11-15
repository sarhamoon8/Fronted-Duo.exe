import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/presentation/lib/cn";

/** Logotipo de Google (colores de marca; es una marca registrada, se usa tal cual). */
function IconoGoogle() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.27-2.09 3.56-5.17 3.56-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.64H1.28a12 12 0 0 0 0 10.72l3.99-3.09z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.64l3.99 3.09C6.22 6.88 8.87 4.77 12 4.77z" />
    </svg>
  );
}

export function BotonGoogle({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-borde bg-superficie px-4 text-sm font-semibold text-tinta",
        "transition duration-150 hover:bg-neutro active:scale-[0.97]",
        className,
      )}
      {...props}
    >
      <IconoGoogle />
      Continuar con Google
    </button>
  );
}
