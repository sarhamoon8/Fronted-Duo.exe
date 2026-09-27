"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Accessibility,
  CalendarPlus,
  Check,
  ChevronDown,
  CircleHelp,
  FileCheck,
  Hospital,
  MapPin,
  Map as MapIcon,
  Pill,
  Stethoscope,
} from "lucide-react";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useCatalogo } from "@/presentation/hooks/use-catalogo";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { useTurnosStore } from "@/presentation/stores/turnos.store";
import { cn, enmascararEmail } from "@/presentation/lib/cn";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina, Pildora } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Input } from "@/presentation/components/ui/field";
import { Spinner } from "@/presentation/components/ui/spinner";

const PASOS = [
  { largo: "Sede y servicio", corto: "Sede" },
  { largo: "Tus datos", corto: "Datos" },
  { largo: "Confirmación", corto: "Confirmar" },
] as const;
/** Icono según el nombre del servicio (el backend solo guarda el nombre). */
function iconoServicio(nombre: string) {
  const n = nombre.toLowerCase();
  if (n.includes("cita")) return CalendarPlus;
  if (n.includes("autoriz")) return FileCheck;
  if (n.includes("informa") || n.includes("orienta")) return CircleHelp;
  if (n.includes("medicament") || n.includes("dispens") || n.includes("farmac")) return Pill;
  return Stethoscope;
}

/** Flujo de 3 pasos: sede (entidad médica) y servicio → datos → POST /turnos. */
export function SolicitarTurno() {
  const router = useRouter();
  const usuario = useSesionStore((s) => s.usuario);
  const guardar = useTurnosStore((s) => s.guardar);
  const [paso, setPaso] = useState(0);
  const [entidadId, setEntidadId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [prioritaria, setPrioritaria] = useState(false);
  const [documento, setDocumento] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const { entidades, servicios, cargandoEntidades, cargandoServicios, error } = useCatalogo(entidadId);

  const entidad = entidades.find((e) => e.id === entidadId);
  const servicio = useMemo(() => servicios.find((s) => s.id === servicioId), [servicios, servicioId]);

  function elegirEntidad(id: string) {
    setEntidadId(id);
    setServicioId("");
  }

  async function confirmar() {
    if (!servicio || !entidad) return;
    setErrores([]);
    setEnviando(true);
    try {
      const turno = await casosDeUso.solicitarTurno.ejecutar(servicio.id);
      guardar(turno, { servicioNombre: servicio.nombre, entidadNombre: entidad.nombre });
      router.push("/turnos?nuevo=1");
    } catch (e) {
      setErrores(e instanceof AppError ? e.mensajes : [mensajeDeError(e)]);
      setEnviando(false);
    }
  }

  return (
    <>
      <EncabezadoPagina titulo="Solicita tu turno" descripcion="Selecciona dónde y para qué trámite necesitas atención." />

      <Pasos actual={paso} />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-5">
          {error && <Alert tono="error" titulo="No se pudo cargar el catálogo">{error}</Alert>}

          {paso === 0 && (
            <>
              <Card aria-labelledby="t-sede">
                <CardTitulo
                  id="t-sede"
                  descripcion="Elige la sede de tu red de salud donde quieres ser atendido."
                  acciones={<Pildora tono="menta" icono={<MapPin className="size-[13px]" aria-hidden="true" />}>Ubicación activa</Pildora>}
                >
                  1. Selecciona una sede
                </CardTitulo>

                {/* Filtros visuales: el backend aún no guarda ciudad ni zona. */}
                <div className="mb-[18px] grid gap-3.5 sm:grid-cols-2">
                  <SelectDecorativo etiqueta="Ciudad" icono={<MapPin className="size-[18px]" />} valor="Bogotá D. C." />
                  <SelectDecorativo etiqueta="Zona o barrio" icono={<MapIcon className="size-[18px]" />} valor="Todas las zonas" destacado />
                </div>

                {cargandoEntidades ? (
                  <Spinner etiqueta="Cargando sedes…" />
                ) : entidades.length === 0 ? (
                  <EstadoVacio titulo="Aún no hay sedes registradas" icono={<Hospital className="size-5" />}>
                    Un administrador debe registrarlas primero.
                  </EstadoVacio>
                ) : (
                  <fieldset>
                    <legend className="sr-only">Sede</legend>
                    <div className="flex flex-col gap-2.5">
                      {entidades.map((e) => (
                        <OpcionFila
                          key={e.id}
                          nombre="sede"
                          seleccionado={e.id === entidadId}
                          onChange={() => elegirEntidad(e.id)}
                          titulo={e.nombre}
                          subtitulo="Sede de la red de salud"
                        />
                      ))}
                    </div>
                  </fieldset>
                )}
              </Card>

              <Card aria-labelledby="t-servicio">
                <CardTitulo id="t-servicio" descripcion="Podrás realizar un trámite por turno.">
                  2. Elige el servicio
                </CardTitulo>
                {!entidadId ? (
                  <p className="text-sm text-tinta-tenue">Primero selecciona una sede.</p>
                ) : cargandoServicios ? (
                  <Spinner etiqueta="Cargando servicios…" />
                ) : servicios.length === 0 ? (
                  <EstadoVacio titulo="Esta sede no tiene servicios registrados" />
                ) : (
                  <fieldset>
                    <legend className="sr-only">Servicio</legend>
                    <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3">
                      {servicios.map((s) => {
                        const Icono = iconoServicio(s.nombre);
                        const activo = s.id === servicioId;
                        return (
                          <label
                            key={s.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl p-4 transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cerceta-noche lg:min-h-[140px] lg:flex-col lg:items-start lg:gap-2.5",
                              activo ? "border-2 border-cerceta bg-aqua" : "border border-borde bg-superficie hover:border-cerceta/50",
                            )}
                          >
                            <input type="radio" name="servicio" className="sr-only" checked={activo} onChange={() => setServicioId(s.id)} />
                            <span className="flex items-center justify-between lg:w-full">
                              <span aria-hidden="true" className={cn("flex size-10 items-center justify-center rounded-xl text-cerceta-oscuro lg:size-auto lg:bg-transparent", activo ? "bg-white/60" : "bg-neutro")}>
                                <Icono className="size-5 lg:size-6" strokeWidth={1.75} />
                              </span>
                              <span className="hidden lg:block"><Radio activo={activo} tamano="sm" /></span>
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold text-titulo">{s.nombre}</span>
                              <span className="mt-1 block text-xs leading-[1.4] text-tinta-tenue">Disponible en esta sede</span>
                            </span>
                            <span className="lg:hidden"><Radio activo={activo} tamano="sm" /></span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
              </Card>
            </>
          )}

          {paso === 1 && usuario && (
            <Card aria-labelledby="t-datos">
              <CardTitulo id="t-datos" descripcion="Verifica tus datos antes de confirmar.">
                Tus datos
              </CardTitulo>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input etiqueta="Nombre" value={usuario.nombre} readOnly />
                <Input etiqueta="Correo" value={usuario.email} readOnly />
                <Input
                  etiqueta="Documento de identidad"
                  inputMode="numeric"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  ayuda="Preséntalo en la ventanilla. No se envía al sistema."
                />
              </div>
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-borde p-4 hover:border-cerceta/50">
                <input type="checkbox" className="mt-0.5 size-5 accent-cerceta" checked={prioritaria} onChange={(e) => setPrioritaria(e.target.checked)} />
                <span>
                  <span className="block text-sm font-semibold">Requiero atención prioritaria</span>
                  <span className="block text-sm text-tinta-tenue">Adulto mayor, gestante o persona con movilidad reducida. Informa en la sede para aplicar el protocolo.</span>
                </span>
              </label>
            </Card>
          )}

          {paso === 2 && entidad && servicio && (
            <Card aria-labelledby="t-confirmar">
              <CardTitulo id="t-confirmar" descripcion="Al confirmar, recibirás tu código y tu posición en la fila.">
                Confirma tu turno
              </CardTitulo>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <Dato titulo="Sede" valor={entidad.nombre} />
                <Dato titulo="Servicio" valor={servicio.nombre} />
                <Dato titulo="Paciente" valor={usuario?.nombre ?? ""} />
                <Dato titulo="Notificaciones" valor={usuario ? enmascararEmail(usuario.email) : ""} />
                {prioritaria && <Dato titulo="Atención" valor="Prioritaria (se valida en la sede)" />}
              </dl>
              <div aria-live="polite" className="mt-4">
                <ListaErrores errores={errores} />
              </div>
            </Card>
          )}

          {paso > 0 && (
            <div className="flex justify-between gap-3">
              <Button variante="secundario" onClick={() => setPaso((p) => p - 1)} disabled={enviando} icono={<ArrowLeft className="size-4" aria-hidden="true" />}>
                Atrás
              </Button>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <Card aria-labelledby="t-resumen" className="flex flex-col gap-[18px] border-transparent bg-aqua p-[22px] sm:p-[22px] lg:sticky lg:top-24 lg:border-borde lg:bg-superficie">
            <div>
              <h2 id="t-resumen" className="text-xl text-titulo">Resumen</h2>
              <p className="mt-1 text-[13px] text-tinta-tenue">Revisa tu selección antes de continuar.</p>
            </div>
            <dl className="flex flex-col gap-[18px]">
              <ItemResumen icono={<Hospital className="size-5" strokeWidth={1.75} />} titulo="Sede" valor={entidad?.nombre} />
              <ItemResumen icono={<CalendarPlus className="size-5" strokeWidth={1.75} />} titulo="Servicio" valor={servicio?.nombre} />
            </dl>
            <div className="flex items-center justify-between rounded-xl bg-menta p-3.5 text-esmeralda-profundo">
              <span className="text-xs">Espera estimada</span>
              <span className="text-base font-extrabold">{servicio ? "Al confirmar" : "—"}</span>
            </div>
            {paso < 2 ? (
              <Button
                className="w-full"
                onClick={() => setPaso((p) => p + 1)}
                disabled={!entidad || !servicio}
                icono={<ArrowRight className="size-[18px]" aria-hidden="true" />}
              >
                Continuar
              </Button>
            ) : (
              <Button className="w-full" onClick={confirmar} cargando={enviando} icono={<Check className="size-[18px]" aria-hidden="true" />}>
                Confirmar turno
              </Button>
            )}
            <p className="text-center text-[11px] leading-[1.4] text-tinta-tenue">
              Tus datos se usan únicamente para gestionar la atención solicitada.
            </p>
          </Card>

          <div className="hidden gap-3 rounded-xl bg-aqua p-4 lg:flex">
            <Accessibility className="size-5 shrink-0 text-cerceta-oscuro" strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-cerceta-oscuro">Atención prioritaria</p>
              <p className="mt-0.5 text-[13px] leading-[1.45] text-tinta">Si eres adulto mayor, gestante o tienes movilidad reducida, indícalo en el siguiente paso.</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function Pasos({ actual }: { actual: number }) {
  return (
    <ol className="mb-5 flex h-14 items-center gap-2 rounded-2xl border border-borde bg-superficie px-3 lg:mb-6 lg:h-16 lg:gap-3 lg:px-6">
      {PASOS.map((p, i) => {
        const hecho = i < actual;
        const activo = i === actual;
        return (
          <li key={p.largo} className="flex flex-1 items-center gap-2 last:flex-none lg:gap-3" aria-current={activo ? "step" : undefined}>
            <span className="flex items-center gap-2 lg:gap-[9px]">
              <span
                className={cn(
                  "flex size-[30px] shrink-0 items-center justify-center rounded-full text-[13px]",
                  activo || hecho ? "bg-cerceta text-white" : "bg-neutro text-tinta-tenue",
                )}
              >
                {hecho ? <Check className="size-4" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn("text-xs lg:text-[13px]", activo ? "font-bold text-cerceta-oscuro" : "text-tinta-tenue", !activo && "hidden sm:inline")}>
                <span className="lg:hidden">{p.corto}</span>
                <span className="hidden lg:inline">{p.largo}</span>
              </span>
            </span>
            {i < PASOS.length - 1 && <span aria-hidden="true" className={cn("h-0.5 flex-1", hecho ? "bg-cerceta" : "bg-borde")} />}
          </li>
        );
      })}
    </ol>
  );
}

function Radio({ activo, tamano = "md" }: { activo: boolean; tamano?: "md" | "sm" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2",
        tamano === "md" ? "size-5" : "size-[18px]",
        activo ? "border-cerceta bg-cerceta" : "border-borde-fuerte bg-superficie",
      )}
    >
      {activo && <span className={cn("rounded-full bg-cerceta ring-2 ring-white", tamano === "md" ? "size-2.5" : "size-2")} />}
    </span>
  );
}

function OpcionFila({
  nombre,
  seleccionado,
  onChange,
  titulo,
  subtitulo,
}: {
  nombre: string;
  seleccionado: boolean;
  onChange: () => void;
  titulo: string;
  subtitulo: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3.5 rounded-xl p-4 transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cerceta-noche",
        seleccionado ? "border-2 border-cerceta bg-aqua" : "border border-borde bg-superficie hover:border-cerceta/50",
      )}
    >
      <input type="radio" name={nombre} className="sr-only" checked={seleccionado} onChange={onChange} />
      <Radio activo={seleccionado} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-titulo">{titulo}</span>
        <span className="mt-0.5 block text-xs text-tinta-tenue">{subtitulo}</span>
      </span>
    </label>
  );
}

function SelectDecorativo({ etiqueta, icono, valor, destacado }: { etiqueta: string; icono: React.ReactNode; valor: string; destacado?: boolean }) {
  // Filtro visual: el backend aún no guarda ciudad ni zona de las sedes.
  return (
    <div className="flex flex-col gap-[7px]">
      <p className="text-[13px] text-tinta">{etiqueta}</p>
      <button
        type="button"
        className={cn(
          "flex h-[50px] w-full items-center gap-2.5 rounded-xl bg-superficie px-3.5 text-left text-sm text-tinta",
          destacado ? "border-2 border-cerceta" : "border border-borde",
        )}
      >
        <span className="text-cerceta-oscuro" aria-hidden="true">{icono}</span>
        <span className="flex-1 truncate">{valor}</span>
        <ChevronDown className="size-4 text-tinta-tenue" aria-hidden="true" />
      </button>
    </div>
  );
}

function ItemResumen({ icono, titulo, valor }: { icono: React.ReactNode; titulo: string; valor?: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-cerceta-oscuro" aria-hidden="true">{icono}</span>
      <div className="min-w-0">
        <dt className="text-[11px] font-bold uppercase text-tinta-tenue">{titulo}</dt>
        <dd className="mt-0.5 text-[13px] font-bold text-tinta">{valor ?? "Sin seleccionar"}</dd>
      </div>
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl bg-neutro-2 p-3.5">
      <dt className="text-xs text-tinta-tenue">{titulo}</dt>
      <dd className="font-semibold">{valor}</dd>
    </div>
  );
}
