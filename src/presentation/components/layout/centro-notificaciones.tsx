"use client";

import { useState } from "react";
import { Bell, CheckCheck, Ticket, TicketCheck, TicketX, Repeat } from "lucide-react";
import { TIPO_NOTIFICACION_ETIQUETA, type TipoNotificacion } from "@/core/domain/entities/notificacion";
import { mensajeDeError } from "@/core/domain/errors";
import { useNotificaciones } from "@/presentation/hooks/use-notificaciones";
import { cn } from "@/presentation/lib/cn";
import { Alert } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Card, EncabezadoPagina } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Spinner } from "@/presentation/components/ui/spinner";

const ICONO: Record<TipoNotificacion, typeof Bell> = {
  TURNO_CREADO: Ticket,
  TURNO_CANCELADO: TicketX,
  TURNO_EN_CURSO: TicketCheck,
  TURNO_REASIGNADO: Repeat,
};

function fechaCorta(fecha: Date) {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    .format(fecha);
}

/** Centro de notificaciones: todas o solo las no leídas, y marcar como leídas. */
export function CentroNotificaciones() {
  const { notificaciones, sinLeer, cargando, error, marcarLeida, marcarTodasLeidas } = useNotificaciones();
  const [filtro, setFiltro] = useState<"todas" | "sin-leer">("todas");
  const [fallo, setFallo] = useState<string | null>(null);
  const visibles = filtro === "todas" ? notificaciones : sinLeer;

  async function ejecutar(accion: () => Promise<void>) {
    setFallo(null);
    try {
      await accion();
    } catch (e) {
      setFallo(mensajeDeError(e));
    }
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Centro de notificaciones"
        descripcion="Avisos sobre tus turnos."
        acciones={
          <Button
            variante="secundario"
            disabled={sinLeer.length === 0}
            onClick={() => void ejecutar(marcarTodasLeidas)}
            icono={<CheckCheck className="size-4" aria-hidden="true" />}
          >
            Marcar todas como leídas
          </Button>
        }
      />

      <div role="tablist" aria-label="Filtro de notificaciones" className="mb-4 inline-flex rounded-xl border border-borde bg-superficie p-1">
        {(
          [
            ["todas", "Todas"],
            ["sin-leer", `Sin leer (${sinLeer.length})`],
          ] as const
        ).map(([valor, etiqueta]) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={filtro === valor}
            onClick={() => setFiltro(valor)}
            className={cn(
              "min-h-10 rounded-lg px-4 text-sm font-bold",
              filtro === valor ? "bg-cerceta text-white" : "text-tinta-tenue hover:bg-neutro",
            )}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {(fallo || error) && (
        <div className="mb-4">
          <Alert tono="error">{fallo ?? error}</Alert>
        </div>
      )}

      <Card className="p-0 sm:p-0">
        {cargando && notificaciones.length === 0 ? (
          <div className="flex justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : visibles.length === 0 ? (
          <div className="p-5">
            <EstadoVacio
              titulo={filtro === "todas" ? "Aún no tienes notificaciones" : "No tienes notificaciones sin leer"}
              icono={<Bell className="size-5" />}
            >
              Te avisaremos cuando cambie el estado de tus turnos.
            </EstadoVacio>
          </div>
        ) : (
          <ul className="divide-y divide-borde">
            {visibles.map((n) => {
              const Icono = ICONO[n.tipo] ?? Bell;
              return (
                <li key={n.id} className={cn("flex gap-3 p-4 sm:p-5", !n.leida && "bg-aqua-suave")}>
                  <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutro text-cerceta-profundo">
                    <Icono className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase text-cerceta">
                      {n.leida ? "Leída" : "Sin leer"} · {TIPO_NOTIFICACION_ETIQUETA[n.tipo] ?? n.tipo}
                    </p>
                    <p className="mt-0.5 font-semibold text-titulo">{n.titulo}</p>
                    <p className="mt-0.5 text-sm text-tinta-tenue">{n.mensaje}</p>
                    <p className="mt-1 text-xs text-tinta-tenue">{fechaCorta(n.creadoEn)}</p>
                  </div>
                  {!n.leida && (
                    <Button variante="fantasma" tamano="sm" onClick={() => void ejecutar(() => marcarLeida(n.id))}>
                      Marcar como leída
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
