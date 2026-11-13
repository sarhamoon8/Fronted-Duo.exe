"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CalendarX, Hourglass, MapPin, Stethoscope, UserRound } from "lucide-react";
import type { Cita } from "@/core/domain/entities/cita";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { fechaLarga, horaCorta, horaDeFranja, hoyColombia, sumarDias } from "@/presentation/lib/fecha-cita";
import { cn } from "@/presentation/lib/cn";
import { useRecurso } from "@/presentation/hooks/use-recurso";
import { Alert } from "@/presentation/components/ui/alert";
import { BotonEnlace, Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Input, Select } from "@/presentation/components/ui/field";
import { Spinner } from "@/presentation/components/ui/spinner";

const DIAS_MAXIMOS = 60;

/**
 * Pedir una cita: sede → especialidad → fecha → hora. El doctor no se elige:
 * el sistema le asigna uno disponible en esa sede y especialidad a esa hora.
 */
export function AgendarCita() {
  const hoy = hoyColombia();
  const [puntoId, setPuntoId] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [fecha, setFecha] = useState("");
  const [franja, setFranja] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agendada, setAgendada] = useState<Cita | null>(null);

  const puntos = useRecurso("puntos-todos", () => casosDeUso.listarPuntos.ejecutar());
  const profesionales = useRecurso(`profesionales-${puntoId}`, () => casosDeUso.listarProfesionales.ejecutar({ puntoId }), {
    activo: Boolean(puntoId),
  });
  const especialidades = useMemo(
    () => [...new Set((profesionales.datos ?? []).map((p) => p.especialidad))].sort((a, b) => a.localeCompare(b, "es")),
    [profesionales.datos],
  );

  const listo = Boolean(puntoId && especialidad && fecha);
  const disponibilidad = useRecurso(
    `disponibilidad-${puntoId}-${especialidad}-${fecha}`,
    () => casosDeUso.consultarDisponibilidadCitas.ejecutar(puntoId, especialidad, fecha),
    { activo: listo },
  );
  const franjas = disponibilidad.datos?.franjas ?? [];
  // Solo se muestran las horas de la consulta vigente (no las de una selección anterior).
  const franjasVigentes = listo && !disponibilidad.cargando ? franjas : [];

  function cambiarSede(id: string) {
    setPuntoId(id);
    setEspecialidad("");
    setFranja("");
    setError(null);
  }
  function cambiarEspecialidad(valor: string) {
    setEspecialidad(valor);
    setFranja("");
    setError(null);
  }
  function cambiarFecha(valor: string) {
    setFecha(valor);
    setFranja("");
    setError(null);
  }

  async function confirmar() {
    setError(null);
    setEnviando(true);
    try {
      setAgendada(await casosDeUso.agendarCita.ejecutar({ puntoId, especialidad, fechaHora: franja }));
    } catch (e) {
      setError(mensajeDeError(e));
      setFranja("");
      disponibilidad.recargar();
    } finally {
      setEnviando(false);
    }
  }

  function otraCita() {
    setAgendada(null);
    setFranja("");
    setEspecialidad("");
    setFecha("");
  }

  const sede = puntos.datos?.find((p) => p.id === puntoId);

  if (agendada) {
    return (
      <>
        <EncabezadoPagina titulo="¡Cita confirmada!" descripcion="Te asignamos un doctor para esa hora." />
        <Card aria-labelledby="t-confirmada">
          <CardTitulo id="t-confirmada" descripcion="Guarda estos datos o consúltalos en «Mis citas».">
            Tu cita
          </CardTitulo>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-neutro p-4">
              <CalendarCheck className="mt-0.5 size-5 shrink-0 text-cerceta" aria-hidden="true" />
              <div>
                <dt className="text-xs font-bold text-tinta">Fecha y hora</dt>
                <dd className="text-base capitalize text-titulo">{fechaLarga(agendada.fechaHora)}</dd>
                <dd className="text-base text-titulo">{horaCorta(agendada.fechaHora)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-neutro p-4">
              <UserRound className="mt-0.5 size-5 shrink-0 text-cerceta" aria-hidden="true" />
              <div>
                <dt className="text-xs font-bold text-tinta">Doctor asignado</dt>
                <dd className="text-base text-titulo">
                  {agendada.profesional ? `Dr(a). ${agendada.profesional.nombres} ${agendada.profesional.apellidos}` : "Por confirmar"}
                </dd>
                <dd className="text-tinta-tenue">{agendada.especialidad}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-neutro p-4 sm:col-span-2">
              <MapPin className="mt-0.5 size-5 shrink-0 text-cerceta" aria-hidden="true" />
              <div>
                <dt className="text-xs font-bold text-tinta">Sede</dt>
                <dd className="text-base text-titulo">{sede ? `${sede.nombreSede} · ${sede.ciudad}` : "Sede elegida"}</dd>
                {sede && <dd className="text-tinta-tenue">{sede.direccion}</dd>}
              </div>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <BotonEnlace href="/citas">Ver mis citas</BotonEnlace>
            <Button variante="secundario" onClick={otraCita}>
              Pedir otra cita
            </Button>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <EncabezadoPagina titulo="Pedir una cita" descripcion="Elige la sede, la especialidad y el día. Nosotros te asignamos el doctor." />

      {error && (
        <div className="mb-4">
          <Alert tono="error">{error}</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <Card aria-labelledby="t-datos">
          <CardTitulo id="t-datos" descripcion="Paso 1: ¿dónde y con quién?">
            Datos de la cita
          </CardTitulo>
          <div className="grid gap-4">
            <Select etiqueta="Sede" value={puntoId} onChange={(e) => cambiarSede(e.target.value)}>
              <option value="">{puntos.cargando ? "Cargando…" : "Selecciona una sede"}</option>
              {(puntos.datos ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombreSede} · {p.ciudad}
                </option>
              ))}
            </Select>
            <Select
              etiqueta="Especialidad"
              value={especialidad}
              disabled={!puntoId || profesionales.cargando}
              onChange={(e) => cambiarEspecialidad(e.target.value)}
              ayuda={puntoId && !profesionales.cargando && especialidades.length === 0 ? "Esta sede aún no tiene doctores registrados." : undefined}
            >
              <option value="">{profesionales.cargando ? "Cargando…" : "Selecciona una especialidad"}</option>
              {especialidades.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
            <Input
              etiqueta="Fecha"
              type="date"
              value={fecha}
              min={hoy}
              max={sumarDias(hoy, DIAS_MAXIMOS)}
              disabled={!especialidad}
              onChange={(e) => cambiarFecha(e.target.value)}
              ayuda={`Puedes pedir cita hasta con ${DIAS_MAXIMOS} días de anticipación.`}
            />
            {profesionales.error && <Alert tono="error">{profesionales.error}</Alert>}
          </div>
        </Card>

        <Card aria-labelledby="t-horas">
          <CardTitulo id="t-horas" descripcion="Paso 2: elige la hora que más te convenga.">
            Horas disponibles
          </CardTitulo>

          {!listo ? (
            <EstadoVacio titulo="Elige sede, especialidad y fecha" icono={<Stethoscope className="size-5" />}>
              Aquí aparecerán las horas libres.
            </EstadoVacio>
          ) : disponibilidad.cargando ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-6" />
            </div>
          ) : disponibilidad.error ? (
            <Alert tono="error">{disponibilidad.error}</Alert>
          ) : franjasVigentes.length === 0 ? (
            <EstadoVacio titulo="No hay horas libres ese día" icono={<CalendarX className="size-5" />}>
              <span className="block">Prueba con otra fecha o únete a la lista de espera.</span>
              <Link href="/lista-espera" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-cerceta underline">
                <Hourglass className="size-4" aria-hidden="true" />
                Ir a la lista de espera
              </Link>
            </EstadoVacio>
          ) : (
            <>
              <p className="mb-3 text-sm capitalize text-tinta-tenue">{fechaLarga(franjasVigentes[0]!.fechaHora)}</p>
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4" aria-label="Horas disponibles">
                {franjasVigentes.map((f) => {
                  const elegida = franja === f.fechaHora.toISOString();
                  return (
                    <li key={f.hora}>
                      <button
                        type="button"
                        aria-pressed={elegida}
                        onClick={() => setFranja(f.fechaHora.toISOString())}
                        className={cn(
                          "min-h-[48px] w-full rounded-xl border px-3 text-sm font-bold transition-colors",
                          elegida
                            ? "border-cerceta bg-cerceta text-white"
                            : "border-borde bg-superficie text-tinta hover:border-cerceta",
                        )}
                      >
                        {horaDeFranja(f.hora)}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-borde pt-4">
                <p className="text-sm text-tinta-tenue">
                  {franja ? "Listo para confirmar. Te asignaremos un doctor disponible." : "Selecciona una hora para continuar."}
                </p>
                <Button cargando={enviando} disabled={!franja} onClick={() => void confirmar()} icono={<CalendarCheck className="size-4" aria-hidden="true" />}>
                  Confirmar cita
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
