"use client";

import Link from "next/link";
import { ArrowRight, Bell, BellDot, CalendarPlus, Clock, Headphones, Pill, Plus, Ticket, TicketPlus } from "lucide-react";
import { codigoCorto, estimarEspera } from "@/core/domain/entities/turno";
import { useMontado } from "@/presentation/hooks/use-montado";
import { cn, fechaLarga, formatearHora, saludo } from "@/presentation/lib/cn";
import { RESERVA_LISTA } from "@/presentation/mocks/demo";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { turnoActivoDe, useMisTurnos, type TurnoGuardado } from "@/presentation/stores/turnos.store";
import { Alert } from "@/presentation/components/ui/alert";
import { BotonEnlace, claseBoton } from "@/presentation/components/ui/button";
import { Card, EncabezadoPagina, Pildora } from "@/presentation/components/ui/card";
import { ESTADO_TURNO_ETIQUETA } from "@/core/domain/entities/turno";

/** Inicio del paciente (Figma: "Dashboard del paciente" y su versión móvil). */
export function DashboardPaciente() {
  const usuario = useSesionStore((s) => s.usuario);
  const turnos = useMisTurnos(usuario?.id);
  const montado = useMontado();
  const activo = montado ? turnoActivoDe(turnos) : null;
  const espera = activo ? estimarEspera(activo.posicion) : null;
  const primerNombre = usuario?.nombre.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      {/* Encabezado móvil: fecha + saludo */}
      <div className="lg:hidden">
        <EncabezadoPagina
          className="mb-0"
          antetitulo={fechaLarga()}
          titulo={`${saludo()}, ${primerNombre}`}
          descripcion="Gestiona tu atención desde un solo lugar."
        />
      </div>
      {/* Encabezado escritorio */}
      <div className="hidden lg:block">
        <EncabezadoPagina
          className="mb-0"
          titulo="Tu salud, sin filas innecesarias"
          descripcion={`${fechaLarga()} · Bogotá D. C.`}
          acciones={
            <BotonEnlace href="/turnos/solicitar" icono={<Plus className="size-[18px]" aria-hidden="true" />}>
              Solicitar nuevo turno
            </BotonEnlace>
          }
        />
      </div>

      {activo && (
        <div className="hidden lg:block">
        <Alert tono="info" titulo="Tienes un turno activo" icono={<Bell className="size-5" />}>
          {activo.entidadNombre} ·{" "}
          {activo.estado === "EN_CURSO"
            ? "Es tu turno: acércate a la ventanilla."
            : `Faltan aproximadamente ${espera} minutos. Te avisaremos cuando se acerque tu llamado.`}
        </Alert>
        </div>
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {activo ? <TurnoEnCurso turno={activo} /> : <SinTurno />}
        </div>
        <ReservaLista />
      </div>

      <section aria-labelledby="t-accesos" className="flex flex-col gap-4">
        <div>
          <h2 id="t-accesos" className="text-lg text-titulo lg:text-xl">Accesos rápidos</h2>
          <p className="mt-1 text-xs text-tinta-tenue lg:text-[13px]">
            Las gestiones más frecuentes<span className="hidden lg:inline">, siempre a la mano</span>.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-4">
          <AccesoRapido
            href="/turnos/solicitar"
            icono={<TicketPlus className="size-[18px] lg:size-5" strokeWidth={1.75} />}
            tono="menta"
            titulo="Solicitar un turno"
            tituloCorto="Solicitar turno"
            texto="Elige sede y servicio sin hacer fila."
            accion="Nuevo turno"
          />
          <AccesoRapido
            href="/medicamentos"
            icono={<Pill className="size-[18px] lg:size-5" strokeWidth={1.75} />}
            tono="aqua"
            titulo="Consultar medicamentos"
            tituloCorto="Medicamentos"
            texto="Revisa existencias y reserva tu fórmula."
            accion="Ver fórmula"
          />
          <AccesoRapido
            icono={<CalendarPlus className="size-[18px] lg:size-5" strokeWidth={1.75} />}
            tono="azul"
            titulo="Agendar una cita"
            texto="Consulta disponibilidad en tu red de salud."
            accion="Buscar cita"
            ancho
          />
        </ul>
      </section>

      <div className="flex items-center gap-2.5 rounded-2xl bg-aqua p-3.5 lg:hidden">
        <Headphones className="size-5 text-cerceta-oscuro" strokeWidth={1.75} aria-hidden="true" />
        <div>
          <p className="text-[13px] font-bold text-cerceta-oscuro">¿Necesitas ayuda?</p>
          <p className="text-[11px] text-tinta-tenue">Línea gratuita 01 8000 123 456</p>
        </div>
      </div>
    </div>
  );
}

export function BarraProgreso({
  valor,
  etiqueta,
  alto = "h-2",
  claro = false,
}: {
  valor: number;
  etiqueta: string;
  alto?: string;
  claro?: boolean;
}) {
  const v = Math.max(0, Math.min(100, valor));
  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("w-full overflow-hidden rounded-full", alto, claro ? "bg-white/20" : "bg-borde")}
    >
      <div className={cn("h-full rounded-full", claro ? "bg-esmeralda" : "bg-cerceta")} style={{ width: `${v}%` }} />
    </div>
  );
}

/** Porcentaje de cercanía a la atención: 1.º en la fila = 100 %. */
export function cercania(posicion: number | null) {
  return posicion ? Math.round(100 / posicion) : 100;
}

function TurnoEnCurso({ turno }: { turno: TurnoGuardado }) {
  const posicion = turno.posicion;
  const textoPosicion = posicion ? `Posición ${posicion} en la fila` : "Estás siendo atendido";
  const detalle = `Solicitado a las ${formatearHora(turno.creadoEn)} · ${turno.servicioNombre}`;

  return (
    <>
      {/* Móvil: tarjeta cerceta oscuro */}
      <section aria-label="Turno activo" className="flex flex-col gap-4 rounded-2xl bg-cerceta-oscuro p-5 text-white shadow-tarjeta lg:hidden">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-bold text-aqua">
            <Ticket className="size-[18px]" strokeWidth={1.75} aria-hidden="true" /> TURNO ACTIVO
          </p>
          <Pildora tono="menta">{ESTADO_TURNO_ETIQUETA[turno.estado]}</Pildora>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-white/80">Tu código</p>
            <p className="whitespace-nowrap text-[34px] leading-tight sm:text-[42px]">{codigoCorto(turno.id)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-white/80">Posición</p>
            <p className="text-[22px] font-extrabold">{posicion ?? "—"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <BarraProgreso valor={cercania(posicion)} etiqueta="Cercanía a tu atención" claro />
          <p className="text-[11px] text-white/80">{turno.entidadNombre}</p>
        </div>
        <Link href="/turnos" className={claseBoton("primario", "md", "w-full")}>
          <ArrowRight className="size-[18px]" aria-hidden="true" /> Seguir mi turno
        </Link>
      </section>

      {/* Escritorio */}
      <Card aria-labelledby="t-turno-curso" className="hidden flex-col gap-[18px] lg:flex">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="t-turno-curso" className="text-xl text-titulo">Turno en curso</h2>
            <p className="mt-1 text-[13px] text-tinta-tenue">{turno.entidadNombre}</p>
          </div>
          <Pildora tono="aqua" icono={<Clock className="size-[13px]" aria-hidden="true" />}>
            {ESTADO_TURNO_ETIQUETA[turno.estado]}
          </Pildora>
        </div>
        <div className="flex items-center gap-6 rounded-xl bg-neutro-2 p-5">
          <div className="min-w-[150px] shrink-0">
            <p className="text-[11px] font-bold uppercase text-tinta-tenue">Tu código</p>
            <p className="whitespace-nowrap text-[30px] font-extrabold text-cerceta-oscuro xl:text-[34px]">{codigoCorto(turno.id)}</p>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="text-[15px] font-bold text-tinta">{textoPosicion}</p>
            <BarraProgreso valor={cercania(posicion)} etiqueta="Cercanía a tu atención" />
            <p className="truncate text-xs text-tinta-tenue">{detalle}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-tinta-tenue">
            <BellDot className="size-[17px]" strokeWidth={1.75} aria-hidden="true" /> Avisos activados
          </p>
          <BotonEnlace href="/turnos" variante="estructura" icono={<ArrowRight className="size-[18px]" aria-hidden="true" />}>
            Ver seguimiento
          </BotonEnlace>
        </div>
      </Card>
    </>
  );
}

function SinTurno() {
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl text-titulo">Sin turnos activos</h2>
        <p className="mt-1 text-[13px] text-tinta-tenue">Pide tu turno virtual y sigue tu posición sin hacer fila.</p>
      </div>
      <div className="flex items-center gap-4 rounded-xl bg-neutro-2 p-5">
        <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-xl bg-menta text-esmeralda-profundo">
          <TicketPlus className="size-5" strokeWidth={1.75} />
        </span>
        <p className="text-sm text-tinta">Elige la sede y el servicio, y recibe tu código al instante.</p>
      </div>
      <BotonEnlace href="/turnos/solicitar" icono={<Plus className="size-[18px]" aria-hidden="true" />} className="lg:self-end">
        Solicitar turno
      </BotonEnlace>
    </Card>
  );
}

function ReservaLista() {
  return (
    <Card aria-labelledby="t-reserva" className="flex flex-col gap-4 p-[18px] lg:w-[350px] lg:shrink-0 lg:p-6">
      <div className="flex items-center justify-between">
        <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-menta text-esmeralda-profundo lg:size-11">
          <Pill className="size-5" strokeWidth={1.75} />
        </span>
        <Pildora tono="menta">Reservado</Pildora>
      </div>
      <div>
        <h2 id="t-reserva" className="text-[17px] text-titulo lg:text-lg">Reserva lista para recoger</h2>
        <p className="mt-1.5 text-xs leading-normal text-tinta-tenue lg:text-[13px]">{RESERVA_LISTA.medicamentos}.</p>
      </div>
      <div className="rounded-lg bg-menta p-3">
        <p className="text-[10px] font-bold text-esmeralda-profundo lg:text-[11px]">RECOGE ANTES DE</p>
        <p className="mt-0.5 text-[13px] font-bold text-titulo lg:text-sm">{RESERVA_LISTA.recogerAntesDe}</p>
      </div>
      <Link href="/medicamentos" className={claseBoton("secundario", "md", "w-full")}>
        Ver detalle
      </Link>
    </Card>
  );
}

function AccesoRapido({
  href,
  icono,
  tono,
  titulo,
  tituloCorto,
  texto,
  accion,
  ancho = false,
}: {
  href?: string;
  icono: React.ReactNode;
  tono: "menta" | "aqua" | "azul";
  titulo: string;
  tituloCorto?: string;
  texto: string;
  accion: string;
  ancho?: boolean;
}) {
  const fondos = { menta: "bg-menta text-esmeralda-profundo", aqua: "bg-aqua text-cerceta-oscuro", azul: "bg-azul-fondo text-azul" };
  const contenido = (
    <>
      <span aria-hidden="true" className={cn("flex size-[38px] items-center justify-center rounded-xl lg:size-11", fondos[tono])}>
        {icono}
      </span>
      <span className="block text-[13px] font-bold text-tinta lg:text-base lg:font-normal lg:text-titulo">
        <span className="lg:hidden">{tituloCorto ?? titulo}</span>
        <span className="hidden lg:inline">{titulo}</span>
      </span>
      <span className="block text-[11px] leading-[1.35] text-tinta-tenue lg:text-[13px]">{texto}</span>
      <span className="hidden items-center gap-1.5 text-[13px] font-bold text-cerceta-oscuro lg:flex">
        {accion} <ArrowRight className="size-3.5" aria-hidden="true" />
      </span>
    </>
  );
  const clase =
    "flex h-full min-h-[130px] w-full flex-col items-start gap-2.5 rounded-2xl border border-borde bg-superficie p-3.5 text-left transition hover:border-cerceta/50 lg:gap-3.5 lg:p-5 lg:shadow-tarjeta";
  return (
    <li className={ancho ? "col-span-2 lg:col-span-1" : undefined}>
      {href ? (
        <Link href={href} className={clase}>{contenido}</Link>
      ) : (
        // Aún sin funcionalidad: el backend no gestiona citas.
        <button type="button" className={clase}>{contenido}</button>
      )}
    </li>
  );
}
