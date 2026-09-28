"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Headset, LogOut, User, X } from "lucide-react";
import type { Sesion } from "@/core/domain/entities/sesion";
import { casosDeUso } from "@/infrastructure/container";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { useUiStore } from "@/presentation/stores/ui.store";
import { cn } from "@/presentation/lib/cn";
import { INICIO_POR_ROL, PERFIL_ETIQUETA, estaActivo, navegacionPara } from "./navegacion";
import { Logo } from "./logo";
import { BotonEliminarCuenta } from "./pagina";

/**
 * Estructura principal según el Figma:
 * - Escritorio (lg+): barra lateral cerceta oscuro de 244 px.
 * - Móvil: cabecera cerceta (en <Pagina>) + barra de navegación inferior.
 */
export function AppShell({ sesion, children }: { sesion: Sesion; children: ReactNode }) {
  const pathname = usePathname();
  const cerrarPerfil = useUiStore((s) => s.cerrarPerfil);

  useEffect(() => {
    cerrarPerfil();
  }, [pathname, cerrarPerfil]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[244px_1fr]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2 focus:font-semibold"
      >
        Saltar al contenido
      </a>

      <aside className="hidden bg-cerceta-oscuro lg:block">
        <div className="sticky top-0 h-dvh">
          <BarraLateral sesion={sesion} pathname={pathname} />
        </div>
      </aside>

      <div className="min-w-0 pb-[74px] lg:pb-0">{children}</div>

      <NavegacionInferior sesion={sesion} pathname={pathname} />
      <HojaPerfil sesion={sesion} />
    </div>
  );
}

function BarraLateral({ sesion, pathname }: { sesion: Sesion; pathname: string }) {
  const items = navegacionPara(sesion.rol);
  return (
    <div className="flex h-full flex-col gap-7 overflow-y-auto px-5 pb-6 pt-7 text-white">
      <Link href={INICIO_POR_ROL[sesion.rol]} className="self-start rounded-lg">
        <Logo />
      </Link>

      <div className="rounded-xl bg-white/[0.08] p-3">
        <p className="text-[10px] font-bold uppercase text-aqua">Perfil activo</p>
        <p className="mt-0.5 text-sm">{PERFIL_ETIQUETA[sesion.rol]}</p>
      </div>

      <nav aria-label="Principal">
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => {
            const activo = estaActivo(item, pathname);
            const Icono = item.icono;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    "flex h-[46px] items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                    activo ? "bg-white font-bold text-cerceta-oscuro" : "text-white hover:bg-white/10",
                  )}
                >
                  <Icono className="size-[19px]" strokeWidth={1.75} aria-hidden="true" />
                  {item.etiqueta}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-1 flex-col justify-between gap-6">
        <div className="rounded-xl bg-white/[0.07] p-3.5">
          <Headset className="size-5 text-esmeralda" strokeWidth={1.75} aria-hidden="true" />
          <p className="mt-2 text-[13px] font-bold">¿Necesitas ayuda?</p>
          <p className="mt-2 text-[11px] leading-[1.4] text-white/80">Línea gratuita 01 8000 123 456</p>
        </div>
        <p className="text-[10px] leading-[1.4] text-white/80">FilaCero no diagnostica ni reemplaza la atención médica.</p>
      </div>
    </div>
  );
}

function NavegacionInferior({ sesion, pathname }: { sesion: Sesion; pathname: string }) {
  const items = navegacionPara(sesion.rol).filter((i) => !i.soloEscritorio);
  const { perfilAbierto, abrirPerfil } = useUiStore();

  const clase = (activo: boolean) =>
    cn(
      "flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[10px]",
      activo ? "bg-aqua font-bold text-cerceta-oscuro" : "text-tinta-tenue",
    );

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 flex h-[74px] items-center gap-1 border-t border-borde bg-superficie px-3 py-2 shadow-[0_-4px_20px_0_rgba(16,42,42,0.13)] lg:hidden"
    >
      {items.map((item) => {
        const activo = estaActivo(item, pathname);
        const Icono = item.icono;
        return (
          <Link key={item.href} href={item.href} aria-current={activo ? "page" : undefined} className={clase(activo)}>
            <Icono className="size-5" strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate">{item.corta ?? item.etiqueta}</span>
          </Link>
        );
      })}
      <button type="button" onClick={abrirPerfil} aria-expanded={perfilAbierto} className={clase(perfilAbierto)}>
        <User className="size-5" strokeWidth={1.75} aria-hidden="true" />
        Perfil
      </button>
    </nav>
  );
}

/** Hoja inferior con los datos del usuario y cerrar sesión (móvil). */
function HojaPerfil({ sesion }: { sesion: Sesion }) {
  const router = useRouter();
  const limpiar = useSesionStore((s) => s.limpiar);
  const { perfilAbierto, cerrarPerfil } = useUiStore();
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    if (!perfilAbierto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && cerrarPerfil();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [perfilAbierto, cerrarPerfil]);

  if (!perfilAbierto) return null;

  async function salir() {
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
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="t-perfil">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-titulo/40" onClick={cerrarPerfil} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-superficie p-5 pb-8 shadow-tarjeta">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-cerceta">{PERFIL_ETIQUETA[sesion.rol]}</p>
            <h2 id="t-perfil" className="text-lg text-titulo">{sesion.nombre}</h2>
            <p className="text-sm text-tinta-tenue">{sesion.email}</p>
          </div>
          <button type="button" onClick={cerrarPerfil} aria-label="Cerrar" className="flex size-10 items-center justify-center rounded-full hover:bg-neutro">
            <X className="size-5" />
          </button>
        </div>
        {navegacionPara(sesion.rol)
          .filter((i) => i.soloEscritorio)
          .map((i) => {
            const Icono = i.icono;
            return (
              <Link key={i.href} href={i.href} className="mb-3 flex h-12 items-center gap-3 rounded-xl border border-borde px-4 text-sm text-tinta">
                <Icono className="size-5 text-cerceta-oscuro" strokeWidth={1.75} aria-hidden="true" />
                {i.etiqueta}
              </Link>
            );
          })}
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-aqua p-3.5">
          <Headset className="size-5 text-cerceta-oscuro" strokeWidth={1.75} aria-hidden="true" />
          <div>
            <p className="text-[13px] font-bold text-cerceta-oscuro">¿Necesitas ayuda?</p>
            <p className="text-[11px] text-tinta-tenue">Línea gratuita 01 8000 123 456</p>
          </div>
        </div>
        <button
          type="button"
          onClick={salir}
          disabled={saliendo}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-cerceta text-sm font-bold text-cerceta-oscuro disabled:opacity-60"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
        </button>
        <BotonEliminarCuenta variante="hoja" />
      </div>
    </div>
  );
}
