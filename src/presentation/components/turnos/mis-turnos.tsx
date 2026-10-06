"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Clock, MapPin, Megaphone, Plus, RefreshCw, Smartphone, Ticket, TriangleAlert } from "lucide-react";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { ESTADO_TURNO_ETIQUETA, codigoTurno, estaActivo, estimarEspera, puedeCancelar } from "@/core/domain/entities/turno";
import { casosDeUso } from "@/infrastructure/container";
import { useAhora } from "@/presentation/hooks/use-ahora";
import { useMisTurnos, type TurnoConNombres } from "@/presentation/hooks/use-mis-turnos";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { cn, enmascararEmail, formatearHora, haceCuanto } from "@/presentation/lib/cn";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { BadgeEstadoTurno } from "@/presentation/components/ui/badge";
import { BotonEnlace, Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina, Pildora } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Spinner } from "@/presentation/components/ui/spinner";
import { BarraProgreso, cercania } from "@/presentation/components/paciente/dashboard-paciente";

/** Seguimiento del turno activo del paciente ("Mi turno"). */
export function MisTurnos() {
  const usuario = useSesionStore((s) => s.usuario);
  const { turnos, cargando, error, actualizadoEn, recargar } = useMisTurnos();
  const params = useSearchParams();

  if (cargando) return <Spinner etiqueta="Cargando tu turno…" />;
  if (error) {
    return (
      <>
        <EncabezadoPagina titulo="Mis turnos" />
        <Alert tono="error" titulo="No se pudo cargar tu turno">{error}</Alert>
      </>
    );
  }
  const activo = turnos.find((t) => estaActivo(t.estado)) ?? null;
  const otrosActivos = turnos.filter((t) => t !== activo && estaActivo(t.estado));

  if (!activo) {
    return (
      <>
        <EncabezadoPagina titulo="Mis turnos" descripcion="Aquí verás el avance de tu turno cuando lo solicites." />
        <Card>
          <EstadoVacio titulo="No tienes turnos activos" icono={<Ticket className="size-5" />}>
            <p>Solicita un turno virtual y sigue tu posición desde aquí.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <BotonEnlace href="/turnos/solicitar" icono={<Plus className="size-4" aria-hidden="true" />}>Solicitar turno</BotonEnlace>
              <BotonEnlace href="/historial" variante="secundario">Ver historial</BotonEnlace>
            </div>
          </EstadoVacio>
        </Card>
      </>
    );
  }

  return (
    <>
      {params.get("nuevo") && (
        <Alert tono="exito" titulo="¡Turno asignado!" className="mb-6">
          Guarda tu código {codigoTurno(activo)}. Te avisaremos cuando se acerque tu llamado.
        </Alert>
      )}
      <Seguimiento turno={activo} nombre={usuario?.nombre ?? ""} email={usuario?.email ?? ""} actualizadoEn={actualizadoEn} recargar={recargar} />

      {otrosActivos.length > 0 && (
        <Card className="mt-6" aria-labelledby="t-otros">
          <CardTitulo id="t-otros">Otros turnos activos</CardTitulo>
          <ul className="divide-y divide-borde">
            {otrosActivos.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  <span className="font-mono font-semibold text-cerceta-oscuro">{codigoTurno(t)}</span>{" "}
                  <span className="text-sm">{t.servicioNombre} · {t.entidadNombre}</span>
                </span>
                <BadgeEstadoTurno estado={t.estado} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

function Seguimiento({
  turno,
  nombre,
  email,
  actualizadoEn,
  recargar,
}: {
  turno: TurnoConNombres;
  nombre: string;
  email: string;
  actualizadoEn: number | null;
  recargar: () => void;
}) {
  const ahora = useAhora();
  const [cancelando, setCancelando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const enCurso = turno.estado === "EN_CURSO";
  const posicion = turno.posicion;
  const antes = posicion ? posicion - 1 : 0;
  const espera = estimarEspera(posicion) ?? 0;
  const avance = cercania(posicion);
  const actualizado = haceCuanto(new Date(actualizadoEn ?? ahora), ahora);

  async function cancelar() {
    if (!window.confirm(`¿Cancelar el turno ${codigoTurno(turno)}?`)) return;
    setErrores([]);
    setCancelando(true);
    try {
      await casosDeUso.cancelarTurno.ejecutar(turno);
      recargar();
    } catch (e) {
      setErrores(e instanceof AppError ? e.mensajes : [mensajeDeError(e)]);
    } finally {
      setCancelando(false);
    }
  }

  const botonCancelar = puedeCancelar(turno.estado) && (
    <Button variante="secundario" className="w-full" onClick={cancelar} cargando={cancelando}>
      Cancelar turno
    </Button>
  );

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <EncabezadoPagina
        className="mb-0"
        titulo={enCurso ? "¡Es tu turno!" : "Tu turno está en camino"}
        descripcion={`${turno.entidadNombre} · ${turno.servicioNombre}`}
        acciones={
          <span className="hidden lg:block">
            <Pildora tono="menta" icono={<RefreshCw className="size-[13px]" aria-hidden="true" />}>
              Actualizado {actualizado}
            </Pildora>
          </span>
        }
      />

      <Alert tono="aviso" titulo={enCurso ? "Acércate a la ventanilla" : "Mantente atento"} icono={<TriangleAlert className="size-5" />}>
        {enCurso ? (
          "El personal de atención ya llamó tu turno."
        ) : (
          <>
            Dirígete a la sede cuando falten 2 personas.
            <span className="hidden lg:inline"> Debes presentar tu documento y fórmula médica vigente.</span>
          </>
        )}
      </Alert>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <section aria-label="Tu código" className="flex flex-col gap-[18px] rounded-2xl bg-cerceta-oscuro p-5 text-white shadow-tarjeta sm:p-[30px] lg:w-[380px] lg:shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-aqua">Tu código</p>
            <Pildora tono="menta" icono={<Clock className="size-[13px]" aria-hidden="true" />}>
              {ESTADO_TURNO_ETIQUETA[turno.estado]}
            </Pildora>
          </div>
          <p className="whitespace-nowrap text-center text-[44px] leading-none tracking-tight sm:text-[56px]">{codigoTurno(turno)}</p>
          <div className="rounded-xl bg-white/[0.09] p-3.5 text-center">
            <p className="text-sm font-bold">{nombre}</p>
            <p className="mt-1 text-xs text-white/80">{enmascararEmail(email)}</p>
          </div>
          <p className="flex items-center justify-center gap-2 text-[11px] text-white/80">
            <span className="size-2 rounded-full bg-esmeralda" aria-hidden="true" />
            Turno registrado · actualizado {actualizado}
          </p>
        </section>

        <Card aria-labelledby="t-estado-fila" className="flex min-w-0 flex-1 flex-col gap-[22px] sm:p-7">
          <div>
            <h2 id="t-estado-fila" className="text-xl text-titulo">Estado de la fila</h2>
            <p className="mt-1 text-[13px] text-tinta-tenue">El tiempo puede variar según la duración de cada atención.</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <Metrica titulo="Tu posición" valor={posicion ?? "—"} detalle={enCurso ? "en atención" : "en la fila"} />
            <Metrica titulo="Antes que tú" valor={antes} detalle={antes === 1 ? "persona" : "personas"} />
            <Metrica titulo="Espera estimada" valor={espera} detalle="minutos" destacado />
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between gap-2 text-xs">
              <span className="text-tinta-tenue">Ingreso a la fila</span>
              <span className="font-bold text-cerceta-oscuro">{avance}% de cercanía</span>
              <span className="text-tinta-tenue">Atención</span>
            </div>
            <BarraProgreso valor={avance} etiqueta="Cercanía a tu atención" alto="h-3.5" />
            <div className="flex items-center gap-3 rounded-xl bg-aqua p-3.5">
              <span aria-hidden="true" className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-cerceta text-white">
                <Megaphone className="size-[18px]" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-cerceta-oscuro">SOLICITADO</p>
                <p className="truncate text-base text-titulo">{turno.servicioNombre}</p>
              </div>
              <span className="text-xs text-tinta-tenue">{formatearHora(turno.creadoEn)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div aria-live="polite" className="empty:hidden">
        <ListaErrores errores={errores} />
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <Card aria-labelledby="t-sede" className="flex min-w-0 flex-1 flex-col gap-3.5 p-5 sm:p-5">
          <h2 id="t-sede" className="text-xl text-titulo">Información de la sede</h2>
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 gap-3">
              <MapPin className="size-5 shrink-0 text-cerceta" strokeWidth={1.75} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-tinta">{turno.entidadNombre}</p>
                <p className="mt-0.5 text-xs text-tinta-tenue">{turno.servicioNombre} · Entrada principal</p>
              </div>
            </div>
            <Button variante="secundario" icono={<ArrowRight className="size-[18px]" aria-hidden="true" />} className="w-full sm:w-auto">
              Cómo llegar
            </Button>
          </div>
        </Card>

        <Card aria-labelledby="t-notif" className="hidden flex-col gap-3.5 p-5 sm:p-5 lg:flex lg:w-[360px] lg:shrink-0">
          <h2 id="t-notif" className="text-xl text-titulo">Notificaciones</h2>
          <div className="flex items-center gap-2.5">
            <Smartphone className="size-[18px] text-tinta-tenue" strokeWidth={1.75} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[13px] text-tinta">Correo a {enmascararEmail(email)}</span>
            <Pildora tono="menta">Activas</Pildora>
          </div>
          {botonCancelar}
        </Card>

        <div className="lg:hidden">{botonCancelar}</div>
      </div>

      <Link href="/historial" className="self-center text-sm font-bold text-cerceta-oscuro underline underline-offset-4">
        Ver historial de turnos
      </Link>
    </div>
  );
}

function Metrica({ titulo, valor, detalle, destacado }: { titulo: string; valor: React.ReactNode; detalle: string; destacado?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-xl p-3 sm:p-[18px]", destacado ? "bg-menta text-esmeralda-profundo" : "bg-neutro-2")}>
      <p className={cn("text-[11px] sm:text-xs", !destacado && "text-tinta-tenue")}>{titulo}</p>
      <p className={cn("text-[28px] font-extrabold leading-tight sm:text-[34px]", !destacado && "text-cerceta-oscuro")}>{valor}</p>
      <p className={cn("text-[11px] sm:text-xs", !destacado && "text-tinta-tenue")}>{detalle}</p>
    </div>
  );
}
