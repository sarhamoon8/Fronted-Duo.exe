"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, UserX } from "lucide-react";
import { casosDeUso } from "@/infrastructure/container";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { useUiStore } from "@/presentation/stores/ui.store";
import { cn } from "@/presentation/lib/cn";
import { AntetituloContext, Pildora } from "@/presentation/components/ui/card";
import { Logo } from "./logo";

export interface BarraSuperiorProps {
  /** Texto pequeño en mayúsculas sobre el título (p. ej. "PORTAL DEL PACIENTE"). */
  antetitulo: string;
  titulo: string;
  descripcion?: string;
  /** Muestra la píldora "En servicio" (personal y administración). */
  enServicio?: boolean;
}

/**
 * Página de la zona autenticada.
 * - Escritorio: barra superior blanca de 76 px con antetítulo, título y cuenta.
 * - Móvil: cabecera cerceta con la marca; el antetítulo pasa al encabezado del contenido.
 */
export function Pagina({ barra, children }: { barra: BarraSuperiorProps; children: ReactNode }) {
  return (
    <AntetituloContext.Provider value={barra.antetitulo}>
      <CabeceraMovil />
      <BarraSuperior {...barra} />
      <main id="contenido" tabIndex={-1} className="w-full px-[18px] pb-6 pt-[22px] outline-none sm:px-6 lg:p-8">
        {children}
      </main>
    </AntetituloContext.Provider>
  );
}

export function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

function BotonNotificaciones({ oscuro = false }: { oscuro?: boolean }) {
  return (
    <button
      type="button"
      aria-label="Notificaciones (1 nueva)"
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-full lg:size-[42px]",
        oscuro ? "bg-white/10 text-white hover:bg-white/15" : "border border-borde bg-neutro-2 text-tinta hover:bg-neutro",
      )}
    >
      <Bell className="size-[18px]" strokeWidth={1.75} />
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-2.5 top-2.5 size-2 rounded-full ring-2",
          oscuro ? "bg-esmeralda ring-cerceta-oscuro" : "bg-rojo ring-neutro-2",
        )}
      />
    </button>
  );
}

function CabeceraMovil() {
  const usuario = useSesionStore((s) => s.usuario);
  const abrirPerfil = useUiStore((s) => s.abrirPerfil);
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between bg-cerceta-oscuro px-[18px] lg:hidden">
      <Logo compacto />
      <div className="flex items-center gap-2.5">
        <BotonNotificaciones oscuro />
        {usuario && (
          <button
            type="button"
            onClick={abrirPerfil}
            aria-label={`Perfil de ${usuario.nombre}`}
            className="flex size-10 items-center justify-center rounded-full bg-aqua text-[13px] font-extrabold text-cerceta-oscuro"
          >
            {iniciales(usuario.nombre)}
          </button>
        )}
      </div>
    </header>
  );
}

function BarraSuperior({ antetitulo, titulo, descripcion, enServicio }: BarraSuperiorProps) {
  const usuario = useSesionStore((s) => s.usuario);
  return (
    <header className="sticky top-0 z-30 hidden h-[76px] items-center gap-4 border-b border-borde bg-superficie px-8 lg:flex">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold uppercase text-cerceta">{antetitulo}</p>
        <p className="truncate text-[21px] leading-tight text-titulo">{titulo}</p>
        {descripcion && <p className="truncate text-xs text-tinta-tenue">{descripcion}</p>}
      </div>
      {enServicio && (
        <Pildora tono="menta" icono={<span className="size-2 rounded-full bg-esmeralda" aria-hidden="true" />}>
          En servicio
        </Pildora>
      )}
      <BotonNotificaciones />
      {usuario && <MenuUsuario nombre={usuario.nombre} email={usuario.email} />}
    </header>
  );
}

function MenuUsuario({ nombre, email }: { nombre: string; email: string }) {
  const router = useRouter();
  const limpiar = useSesionStore((s) => s.limpiar);
  const [abierto, setAbierto] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAbierto(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);

  async function cerrarSesion() {
    setSaliendo(true);
    try {
      await casosDeUso.cerrarSesion.ejecutar();
    } finally {
      limpiar();
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-neutro"
      >
        <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-aqua text-[13px] text-cerceta-oscuro">
          {iniciales(nombre)}
        </span>
        <span className="text-left leading-tight">
          <span className="block max-w-44 truncate text-[13px] font-bold text-tinta">{nombre}</span>
          <span className="block text-[11px] text-tinta-tenue">Red Pública de Salud</span>
        </span>
        <ChevronDown className={cn("size-[15px] text-tinta-tenue transition-transform", abierto && "rotate-180")} aria-hidden="true" />
      </button>
      {abierto && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-borde bg-superficie p-2 shadow-lg">
          <div className="border-b border-borde px-3 pb-2 pt-1">
            <p className="truncate text-sm font-bold">{nombre}</p>
            <p className="truncate text-xs text-tinta-tenue">{email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={cerrarSesion}
            disabled={saliendo}
            className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-tinta hover:bg-neutro disabled:opacity-60"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
          <BotonEliminarCuenta variante="menu" />
        </div>
      )}
    </div>
  );
}

/**
 * Eliminar cuenta: por ahora SIN acción. El backend aún no expone un endpoint
 * para borrar el propio usuario (solo existen GET/POST /usuarios).
 */
export function BotonEliminarCuenta({ variante }: { variante: "menu" | "hoja" }) {
  if (variante === "menu") {
    return (
      <button
        type="button"
        role="menuitem"
        className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-peligro hover:bg-rojo-fondo"
      >
        <UserX className="size-4" aria-hidden="true" />
        Eliminar cuenta
      </button>
    );
  }
  return (
    <button
      type="button"
      className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-peligro text-sm font-bold text-peligro hover:bg-rojo-fondo"
    >
      <UserX className="size-4" aria-hidden="true" />
      Eliminar cuenta
    </button>
  );
}
