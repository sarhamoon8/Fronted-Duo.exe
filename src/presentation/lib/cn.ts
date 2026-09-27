/** Une clases condicionales sin dependencias externas. */
export function cn(...clases: (string | false | null | undefined)[]): string {
  return clases.filter(Boolean).join(" ");
}

const ZONA = "America/Bogota";

export function formatearFechaHora(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: ZONA }).format(d);
}

export function formatearHora(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit", timeZone: ZONA }).format(d);
}

/** "Viernes, 25 de septiembre" */
export function fechaLarga(fecha: Date = new Date()): string {
  const s = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: ZONA }).format(fecha);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "25 sep" */
export function fechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", timeZone: ZONA }).format(fecha).replace(".", "");
}

export function horaBogota(fecha: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: ZONA }).format(fecha));
}

export function saludo(fecha: Date = new Date()): string {
  const h = horaBogota(fecha);
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function esHoy(fecha: Date | string): boolean {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const f = (x: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(x);
  return f(d) === f(new Date());
}

export function minutosDesde(fecha: Date | string, ahora: number = Date.now()): number {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return Math.max(0, Math.round((ahora - d.getTime()) / 60_000));
}

/** "hace 40 s", "hace 3 min", "hace 2 h" */
export function haceCuanto(fecha: Date | string, ahora: number = Date.now()): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const s = Math.max(0, Math.round((ahora - d.getTime()) / 1000));
  if (s < 10) return "hace un momento";
  if (s < 60) return `hace ${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  return `hace ${Math.round(m / 60)} h`;
}

/** "maria.perez@correo.co" → "m•••••@correo.co" */
export function enmascararEmail(email: string): string {
  const [u, d] = email.split("@");
  return `${u?.[0] ?? ""}•••••@${d ?? ""}`;
}
