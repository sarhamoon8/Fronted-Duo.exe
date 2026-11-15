const ZONA = "America/Bogota";
const DIA_MS = 86_400_000;

/** Fecha de hoy en Colombia (YYYY-MM-DD), sin importar la zona del navegador. */
export function hoyColombia(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(ahora);
}

/** Suma `dias` a una fecha YYYY-MM-DD. */
export function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(a, m - 1, d) + dias * DIA_MS).toISOString().slice(0, 10);
}

/** «martes, 17 de noviembre de 2026» */
export function fechaLarga(instante: Date): string {
  return new Intl.DateTimeFormat("es-CO", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(instante);
}

/** «8:30 a. m.» */
export function horaCorta(instante: Date): string {
  return new Intl.DateTimeFormat("es-CO", { timeZone: ZONA, hour: "numeric", minute: "2-digit", hour12: true }).format(instante);
}

/** Convierte «HH:mm» (24 h) en «8:30 a. m.» sin depender de la zona horaria. */
export function horaDeFranja(hora: string): string {
  const [h, m] = hora.split(":").map(Number) as [number, number];
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}
