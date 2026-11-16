import Image from "next/image";
import { cn } from "@/presentation/lib/cn";
import logoFilaCero from "../../../../public/filacero-logo.png";

// Dimensiones reales de public/filacero-logo.png (1408x768). Se pasan
// explícitas porque bajo Vitest el import estático no trae esta metadata
// como sí ocurre en el build real de Next.
const ANCHO_LOGO = 1408;
const ALTO_LOGO = 768;

/**
 * Marca FilaCero (ícono + nombre en una sola imagen, fondo blanco). Se
 * envuelve en una tarjeta blanca redondeada para que se vea bien sobre los
 * fondos cerceta oscuro de la barra lateral, las cabeceras y la bienvenida.
 */
export function Logo({ compacto = false, className }: { compacto?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-xl bg-white shadow-tarjeta", compacto ? "h-10 px-2" : "h-12 px-2.5", className)}>
      <Image src={logoFilaCero} alt="FilaCero" width={ANCHO_LOGO} height={ALTO_LOGO} className="h-full w-auto" />
    </span>
  );
}

/** Igual que <Logo /> pero más grande, para la pantalla de bienvenida. */
export function LogoInsignia({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-2xl bg-white p-3 shadow-tarjeta sm:p-4", className)}>
      <Image src={logoFilaCero} alt="FilaCero" width={ANCHO_LOGO} height={ALTO_LOGO} priority className="h-16 w-auto sm:h-20" />
    </span>
  );
}

/** Logotipo a color completo, sin tarjeta: para usarlo directo sobre fondos claros. */
export function LogoCompleto({ className }: { className?: string }) {
  return (
    <Image
      src={logoFilaCero}
      alt="FilaCero"
      width={ANCHO_LOGO}
      height={ALTO_LOGO}
      className={cn("h-auto w-44 sm:w-52", className)}
    />
  );
}
