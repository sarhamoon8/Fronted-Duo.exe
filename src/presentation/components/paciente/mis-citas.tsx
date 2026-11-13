"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CalendarPlus, MapPin, Stethoscope, UserRound, XCircle } from "lucide-react";
import { ESTADO_CITA_ETIQUETA, type Cita } from "@/core/domain/entities/cita";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { fechaLarga, horaCorta } from "@/presentation/lib/fecha-cita";
import { useRecurso } from "@/presentation/hooks/use-recurso";
import { Alert } from "@/presentation/components/ui/alert";
import { BotonEnlace, Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina, Pildora } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Spinner } from "@/presentation/components/ui/spinner";

const TONO = { PROGRAMADA: "menta", COMPLETADA: "aqua", CANCELADA: "neutro" } as const;

/** Mis citas: próximas (con opción de cancelar) y anteriores. */
export function MisCitas() {
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tono: "exito" | "error"; texto: string } | null>(null);

  const citas = useRecurso("mis-citas", () => casosDeUso.misCitas.ejecutar(), { intervaloMs: 60_000 });
  const puntos = useRecurso("puntos-todos", () => casosDeUso.listarPuntos.ejecutar());
  const nombrePunto = useMemo(
    () => new Map((puntos.datos ?? []).map((p) => [p.id, `${p.nombreSede} · ${p.ciudad}`])),
    [puntos.datos],
  );

  const { proximas, anteriores } = useMemo(() => {
    const ahora = Date.now();
    const todas = citas.datos ?? [];
    return {
      proximas: todas.filter((c) => c.estado === "PROGRAMADA" && c.fechaHora.getTime() > ahora).sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime()),
      anteriores: todas.filter((c) => !(c.estado === "PROGRAMADA" && c.fechaHora.getTime() > ahora)).sort((a, b) => b.fechaHora.getTime() - a.fechaHora.getTime()),
    };
  }, [citas.datos]);

  async function cancelar(id: string) {
    setMensaje(null);
    setCancelandoId(id);
    try {
      await casosDeUso.cancelarCita.ejecutar(id);
      setMensaje({ tono: "exito", texto: "Cancelaste tu cita. La hora quedó libre para otras personas." });
      citas.recargar();
    } catch (e) {
      setMensaje({ tono: "error", texto: mensajeDeError(e) });
    } finally {
      setCancelandoId(null);
    }
  }

  function tarjeta(cita: Cita, conAccion: boolean) {
    return (
      <li key={cita.id} className="rounded-xl border border-borde p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Pildora tono={TONO[cita.estado]}>{ESTADO_CITA_ETIQUETA[cita.estado]}</Pildora>
            <p className="mt-2 flex items-center gap-2 text-lg text-titulo">
              <Stethoscope className="size-4 shrink-0 text-cerceta" aria-hidden="true" />
              {cita.especialidad}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-tinta-tenue">
              <UserRound className="size-4 shrink-0" aria-hidden="true" />
              {cita.profesional ? `Dr(a). ${cita.profesional.nombres} ${cita.profesional.apellidos}` : "Doctor por confirmar"}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-tinta-tenue">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {nombrePunto.get(cita.puntoId) ?? "Sede"}
            </p>
          </div>
          <div className="rounded-xl bg-neutro px-4 py-3 text-right">
            <p className="text-xs capitalize text-tinta-tenue">{fechaLarga(cita.fechaHora)}</p>
            <p className="text-2xl text-titulo">{horaCorta(cita.fechaHora)}</p>
          </div>
        </div>
        {conAccion && (
          <div className="mt-3 flex justify-end">
            <Button variante="secundario" tamano="sm" cargando={cancelandoId === cita.id} onClick={() => void cancelar(cita.id)} icono={<XCircle className="size-4" aria-hidden="true" />}>
              Cancelar cita
            </Button>
          </div>
        )}
      </li>
    );
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Mis citas"
        descripcion="Consulta tus próximas citas, el doctor asignado y cancela si no puedes asistir."
        acciones={
          <BotonEnlace href="/citas/nueva" icono={<CalendarPlus className="size-4" aria-hidden="true" />}>
            Pedir una cita
          </BotonEnlace>
        }
      />

      {mensaje && (
        <div className="mb-4">
          <Alert tono={mensaje.tono}>{mensaje.texto}</Alert>
        </div>
      )}

      {citas.cargando && !citas.datos ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-6" />
        </div>
      ) : citas.error && !citas.datos ? (
        <Alert tono="error">{citas.error}</Alert>
      ) : (
        <div className="grid gap-5">
          <Card aria-labelledby="t-proximas">
            <CardTitulo id="t-proximas" descripcion="Citas programadas que todavía no han pasado.">
              Próximas citas
            </CardTitulo>
            {proximas.length === 0 ? (
              <EstadoVacio titulo="No tienes citas programadas" icono={<CalendarDays className="size-5" />}>
                Pide una cita y te asignaremos un doctor.
              </EstadoVacio>
            ) : (
              <ul className="grid gap-3">{proximas.map((c) => tarjeta(c, true))}</ul>
            )}
          </Card>

          {anteriores.length > 0 && (
            <Card aria-labelledby="t-anteriores">
              <CardTitulo id="t-anteriores" descripcion="Citas atendidas, canceladas o ya pasadas.">
                Anteriores
              </CardTitulo>
              <ul className="grid gap-3">{anteriores.map((c) => tarjeta(c, false))}</ul>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
