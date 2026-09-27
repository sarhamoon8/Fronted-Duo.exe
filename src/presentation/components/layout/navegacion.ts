import {
  BarChart3,
  CheckCircle2,
  ClockFading,
  History,
  House,
  LayoutGrid,
  ListOrdered,
  Package,
  Pill,
  Stethoscope,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import type { Rol } from "@/core/domain/entities/rol";

export interface ItemNavegacion {
  href: string;
  etiqueta: string;
  /** Etiqueta corta para la barra inferior en móvil. */
  corta?: string;
  icono: LucideIcon;
  /** Si es true, no aparece en la barra inferior móvil (se accede desde Perfil). */
  soloEscritorio?: boolean;
  /** Si es true, solo se marca activo en la ruta exacta (no en sus hijas). */
  exacto?: boolean;
}

export const NAVEGACION: Record<Rol, ItemNavegacion[]> = {
  PACIENTE: [
    { href: "/inicio", etiqueta: "Inicio", icono: House },
    { href: "/turnos", etiqueta: "Mis turnos", corta: "Turnos", icono: Ticket },
    { href: "/medicamentos", etiqueta: "Medicamentos", corta: "Medicinas", icono: Pill },
    { href: "/historial", etiqueta: "Historial", icono: ClockFading, soloEscritorio: true },
  ],
  FUNCIONARIO: [
    { href: "/fila", etiqueta: "Cola de turnos", corta: "Cola", icono: ListOrdered, exacto: true },
    { href: "/fila/atendidos", etiqueta: "Turnos atendidos", corta: "Atendidos", icono: CheckCircle2 },
    { href: "/fila/historial", etiqueta: "Historial", icono: History },
  ],
  ADMIN: [
    { href: "/admin", etiqueta: "Resumen", icono: LayoutGrid, exacto: true },
    { href: "/admin/servicios", etiqueta: "Servicios", icono: Stethoscope },
    { href: "/admin/inventario", etiqueta: "Inventario", icono: Package },
    { href: "/admin/reportes", etiqueta: "Reportes", icono: BarChart3 },
  ],
};

export const PERFIL_ETIQUETA: Record<Rol, string> = {
  PACIENTE: "Paciente",
  FUNCIONARIO: "Personal de atención",
  ADMIN: "Administrador",
};

/** Página de inicio de cada rol. */
export const INICIO_POR_ROL: Record<Rol, string> = {
  PACIENTE: "/inicio",
  FUNCIONARIO: "/fila",
  ADMIN: "/admin",
};

export function navegacionPara(rol: Rol) {
  return NAVEGACION[rol];
}

export function estaActivo(item: ItemNavegacion, pathname: string) {
  return item.exacto ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}
