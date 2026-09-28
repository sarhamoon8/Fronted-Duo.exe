"use client";

import { useEffect, useRef, useState } from "react";
import {
  Accessibility,
  ArrowLeftRight,
  Check,
  CircleCheck,
  Clock3,
  Megaphone,
  MoreVertical,
  PauseCircle,
  Power,
  RefreshCw,
  Timer,
  UserX,
  Users,
} from "lucide-react";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { ESTADO_TURNO_ETIQUETA, codigoCorto, type Turno } from "@/core/domain/entities/turno";
import { casosDeUso } from "@/infrastructure/container";
import { useAhora } from "@/presentation/hooks/use-ahora";
import { INTERVALO_COLA_MS, useCola, type ColaState } from "@/presentation/hooks/use-cola";
import { cn, esHoy, formatearHora, horaBogota, minutosDesde } from "@/presentation/lib/cn";
import { Pagina } from "@/presentation/components/layout/pagina";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina, Indicador, Pildora } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Spinner } from "@/presentation/components/ui/spinner";
import { SelectorPuesto } from "./selector-puesto";

const META_ESPERA_MIN = 30;

/** Vista "Cola de atención" del personal de atención. */
export function PanelFila() {
  const cola = useCola();
  const ahora = useAhora(30_000);
  const [accion, setAccion] = useState<string | null>(null);
  const [errores, setErrores] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  const turnos = cola.fila?.turnos ?? [];
  const pendientes = turnos.filter((t) => t.estado === "PENDIENTE");
  const enCurso = turnos.filter((t) => t.estado === "EN_CURSO");
  const actual = enCurso[0] ?? null;
  const siguiente = cola.fila?.siguiente ?? null;
  const atendidosHoy = turnos.filter((t) => t.estado === "ATENDIDO" && esHoy(t.creadoEn)).length;
  const esperaProm = pendientes.length
    ? Math.round(pendientes.reduce((s, t) => s + minutosDesde(t.creadoEn, ahora), 0) / pendientes.length)
    : null;
  const jornada = horaBogota() < 13 ? "Turno de la mañana · 7:00 a. m. a 1:00 p. m." : "Turno de la tarde · 1:00 p. m. a 7:00 p. m.";

  async function ejecutar(t: Turno, tipo: "avanzar" | "cancelar", confirmar?: string) {
    if (confirmar && !window.confirm(confirmar)) return;
    setAccion(`${tipo}:${t.id}`);
    setErrores([]);
    setAviso(null);
    try {
      const r =
        tipo === "avanzar"
          ? await casosDeUso.avanzarTurno.ejecutar(t, cola.ventanillaId || undefined)
          : await casosDeUso.cancelarTurno.ejecutar(t);
      setAviso(`Turno ${codigoCorto(r.id)}: ${ESTADO_TURNO_ETIQUETA[r.estado].toLowerCase()}.`);
    } catch (e) {
      setErrores(e instanceof AppError ? e.mensajes : [mensajeDeError(e)]);
    } finally {
      await cola.recargar();
      setAccion(null);
    }
  }

  return (
    <Pagina
      barra={{
        antetitulo: cola.entidad?.nombre ?? "Personal de atención",
        titulo: "Cola de atención",
        descripcion: cola.servicio ? `Módulo de ${cola.servicio.nombre.toLowerCase()}` : "Selecciona tu puesto de atención",
        enServicio: true,
      }}
    >
      <EncabezadoPagina
        titulo="Turnos por atender"
        descripcion={jornada}
        acciones={
          <>
            <Button variante="secundario" icono={<PauseCircle className="size-4" aria-hidden="true" />}>Pausar ventanilla</Button>
            <Button variante="peligro" icono={<Power className="size-4" aria-hidden="true" />}>Cerrar turno</Button>
          </>
        }
      />

      <SelectorPuesto cola={cola} />

      {!cola.puntoId ? (
        <EstadoVacio titulo="Selecciona una sede y un punto de atención" icono={<Users className="size-5" />}>
          Verás aquí la cola de turnos en tiempo real.
        </EstadoVacio>
      ) : cola.cargandoFila ? (
        <Spinner etiqueta="Cargando la cola…" />
      ) : (
        <>
          <section aria-label="Indicadores" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador etiqueta="En espera" icono={<Users className="size-4" />} valor={pendientes.length} detalle={`${enCurso.length} en atención ahora`} />
            <Indicador etiqueta="Atendidos hoy" icono={<CircleCheck className="size-4" />} tono="menta" valor={atendidosHoy} detalle="Turnos finalizados en este servicio" />
            <Indicador etiqueta="Espera promedio" icono={<Clock3 className="size-4" />} tono="azul" valor={esperaProm !== null ? `${esperaProm} min` : "—"} detalle={`Meta de sede: menos de ${META_ESPERA_MIN} min`} />
            <Indicador etiqueta="Atención promedio" icono={<Timer className="size-4" />} tono="ambar" valor="—" detalle="Se calculará con los tiempos de atención" />
          </section>

          <div aria-live="polite" className="mb-4 flex flex-col gap-3 empty:hidden">
            {aviso && <Alert tono="exito" titulo={aviso} />}
            <ListaErrores errores={cola.errorFila ? [cola.errorFila, ...errores] : errores} />
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
            <Card aria-labelledby="t-actual">
              <CardTitulo
                id="t-actual"
                descripcion="Confirma el resultado para avanzar la fila."
                acciones={actual && <Pildora tono="menta" icono={<span className="size-2 rounded-full bg-esmeralda" aria-hidden="true" />}>En atención · {enCurso.length}</Pildora>}
              >
                Atendiendo ahora
              </CardTitulo>
              {actual ? (
                <>
                  <div className="flex flex-wrap items-center gap-6 rounded-xl bg-cerceta-oscuro px-5 py-4 text-white">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">Turno actual</p>
                      <p className="font-mono text-3xl font-semibold">{codigoCorto(actual.id)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{cola.nombrePaciente(actual.usuarioId)}</p>
                      <p className="text-xs text-white/80">{cola.servicio?.nombre}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">Llegada</p>
                      <p className="text-xl font-semibold">{formatearHora(actual.creadoEn)}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-[1.2fr_1fr_auto]">
                    <Button
                      onClick={() => ejecutar(actual, "avanzar")}
                      cargando={accion === `avanzar:${actual.id}`}
                      disabled={accion !== null}
                      icono={<Check className="size-4" aria-hidden="true" />}
                    >
                      Marcar como atendido
                    </Button>
                    <Button
                      variante="secundario"
                      onClick={() => ejecutar(actual, "cancelar", `¿Marcar ${codigoCorto(actual.id)} como no presentado? El turno se cancelará.`)}
                      cargando={accion === `cancelar:${actual.id}`}
                      disabled={accion !== null}
                      icono={<UserX className="size-4" aria-hidden="true" />}
                    >
                      No se presentó
                    </Button>
                    <Button variante="secundario" icono={<ArrowLeftRight className="size-4" aria-hidden="true" />}>Transferir</Button>
                  </div>
                </>
              ) : (
                <EstadoVacio titulo="No hay nadie en atención">Llama al siguiente turno para empezar.</EstadoVacio>
              )}
            </Card>

            <section aria-labelledby="t-siguiente" className="flex flex-col rounded-2xl border border-esmeralda/40 bg-menta p-5">
              <div className="flex items-start justify-between">
                <h2 id="t-siguiente" className="font-semibold text-cerceta-noche">Siguiente en fila</h2>
                <Users className="size-5 text-cerceta-profundo" aria-hidden="true" />
              </div>
              {siguiente ? (
                <>
                  <p className="mt-3 font-mono text-3xl font-semibold text-cerceta-oscuro">{codigoCorto(siguiente.id)}</p>
                  <p className="font-semibold text-cerceta-noche">{cola.nombrePaciente(siguiente.usuarioId)}</p>
                  <p className="text-sm text-cerceta-noche/85">
                    {cola.servicio?.nombre} · Espera {minutosDesde(siguiente.creadoEn, ahora)} min
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => ejecutar(siguiente, "avanzar")}
                    cargando={accion === `avanzar:${siguiente.id}`}
                    disabled={accion !== null}
                    icono={<Megaphone className="size-4" aria-hidden="true" />}
                  >
                    Llamar al siguiente
                  </Button>
                  <p className="mt-2 text-center text-xs text-cerceta-noche/85">El turno pasará a “En atención”.</p>
                </>
              ) : (
                <p className="mt-3 text-sm text-cerceta-noche">No hay turnos en espera.</p>
              )}
            </section>
          </div>

          <Alert tono="aviso" titulo="Atención prioritaria" icono={<Accessibility className="size-5" />} className="mb-6">
            Adultos mayores, gestantes y personas con movilidad reducida se atienden según el protocolo de prioridad de la sede.
          </Alert>

          <ColaActual cola={cola} pendientes={pendientes} ahora={ahora} accion={accion} ejecutar={ejecutar} />
        </>
      )}
    </Pagina>
  );
}

function ColaActual({
  cola,
  pendientes,
  ahora,
  accion,
  ejecutar,
}: {
  cola: ColaState;
  pendientes: Turno[];
  ahora: number;
  accion: string | null;
  ejecutar: (t: Turno, tipo: "avanzar" | "cancelar", confirmar?: string) => Promise<void>;
}) {
  const [refrescando, setRefrescando] = useState(false);
  async function refrescar() {
    setRefrescando(true);
    await cola.recargar();
    setRefrescando(false);
  }

  return (
    <Card aria-labelledby="t-cola">
      <CardTitulo
        id="t-cola"
        descripcion={`${pendientes.length} ${pendientes.length === 1 ? "persona espera" : "personas esperan"} atención · orden de llegada${cola.ultimaCarga ? ` · actualizado ${formatearHora(cola.ultimaCarga)}` : "."}`}
        acciones={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-tinta-suave">
              <input type="checkbox" className="size-4 accent-cerceta" checked={cola.autoActualizar} onChange={(e) => cola.setAutoActualizar(e.target.checked)} />
              Auto ({INTERVALO_COLA_MS / 1000} s)
            </label>
            <Button variante="secundario" onClick={refrescar} cargando={refrescando} icono={<RefreshCw className="size-4" aria-hidden="true" />}>
              Actualizar
            </Button>
          </div>
        }
      >
        Cola actual
      </CardTitulo>

      {pendientes.length === 0 ? (
        <EstadoVacio titulo="No hay turnos en espera" />
      ) : (
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Turnos en espera del servicio {cola.servicio?.nombre}, en orden de llegada</caption>
            <thead className="bg-neutro text-[11px] uppercase tracking-wider text-tinta-tenue">
              <tr>
                <th scope="col" className="rounded-l-lg px-4 py-2.5 font-semibold">Turno</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Paciente</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Servicio</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Llegada</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Espera</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Prioridad</th>
                <th scope="col" className="rounded-r-lg px-4 py-2.5"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {pendientes.map((t, i) => {
                const espera = minutosDesde(t.creadoEn, ahora);
                return (
                  <tr key={t.id} className={i === 0 ? "bg-menta-suave" : undefined}>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-mono font-semibold text-cerceta-oscuro">
                        <span className={cn("size-1.5 rounded-full", i === 0 ? "bg-esmeralda" : "bg-borde-fuerte")} aria-hidden="true" />
                        {codigoCorto(t.id)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{cola.nombrePaciente(t.usuarioId)}</td>
                    <td className="px-4 py-3">{cola.servicio?.nombre}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatearHora(t.creadoEn)}</td>
                    <td className={cn("px-4 py-3 font-semibold", espera >= META_ESPERA_MIN ? "text-ambar-vivo" : "text-tinta")}>{espera} min</td>
                    <td className="px-4 py-3"><Pildora tono="neutro">General</Pildora></td>
                    <td className="px-4 py-3 text-right">
                      <MenuAcciones
                        etiqueta={codigoCorto(t.id)}
                        deshabilitado={accion !== null}
                        acciones={[
                          { texto: "Llamar", onClick: () => ejecutar(t, "avanzar") },
                          { texto: "Cancelar turno", onClick: () => ejecutar(t, "cancelar", `¿Cancelar el turno ${codigoCorto(t.id)}?`) },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function MenuAcciones({
  etiqueta,
  acciones,
  deshabilitado,
}: {
  etiqueta: string;
  acciones: { texto: string; onClick: () => void }[];
  deshabilitado?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
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

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={`Acciones del turno ${etiqueta}`}
        aria-haspopup="menu"
        aria-expanded={abierto}
        disabled={deshabilitado}
        onClick={() => setAbierto((v) => !v)}
        className="flex size-9 items-center justify-center rounded-lg text-tinta-tenue hover:bg-neutro disabled:opacity-50"
      >
        <MoreVertical className="size-4" />
      </button>
      {abierto && (
        <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-borde bg-superficie p-1.5 text-left shadow-lg">
          {acciones.map((a) => (
            <button
              key={a.texto}
              type="button"
              role="menuitem"
              onClick={() => {
                setAbierto(false);
                a.onClick();
              }}
              className="flex min-h-9 w-full items-center rounded-lg px-3 text-sm hover:bg-neutro"
            >
              {a.texto}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
