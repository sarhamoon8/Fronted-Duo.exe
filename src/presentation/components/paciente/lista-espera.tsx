"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Bell, Clock3, ListPlus, LogOut, MapPin, Stethoscope } from "lucide-react";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useCatalogo } from "@/presentation/hooks/use-catalogo";
import { useRecurso } from "@/presentation/hooks/use-recurso";
import { Alert } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina, Pildora } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Select } from "@/presentation/components/ui/field";
import { Spinner } from "@/presentation/components/ui/spinner";

/** Lista de espera del paciente: inscribirse por sede y servicio, ver la posición y salir. */
export function ListaEsperaPaciente() {
  const [entidadId, setEntidadId] = useState("");
  const [puntoId, setPuntoId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [saliendoId, setSaliendoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tono: "exito" | "error"; texto: string } | null>(null);

  const catalogo = useCatalogo(entidadId);
  const inscripciones = useRecurso("inscripciones", () => casosDeUso.misInscripcionesEspera.ejecutar(), {
    intervaloMs: 30_000,
  });
  const todosLosPuntos = useRecurso("puntos-todos", () => casosDeUso.listarPuntos.ejecutar());
  const todosLosServicios = useRecurso("servicios-todos", () => casosDeUso.listarServicios.ejecutar());

  const nombrePunto = useMemo(
    () => new Map((todosLosPuntos.datos ?? []).map((p) => [p.id, `${p.nombreSede} · ${p.ciudad}`])),
    [todosLosPuntos.datos],
  );
  const nombreServicio = useMemo(
    () => new Map((todosLosServicios.datos ?? []).map((s) => [s.id, s.nombre])),
    [todosLosServicios.datos],
  );

  function elegirEntidad(id: string) {
    setEntidadId(id);
    setPuntoId("");
    setServicioId("");
  }

  async function unirse() {
    setMensaje(null);
    setEnviando(true);
    try {
      const entrada = await casosDeUso.unirseListaEspera.ejecutar(servicioId, puntoId);
      setMensaje({ tono: "exito", texto: `Quedaste en la lista de espera en la posición ${entrada.posicion}.` });
      setServicioId("");
      inscripciones.recargar();
    } catch (e) {
      setMensaje({ tono: "error", texto: mensajeDeError(e) });
    } finally {
      setEnviando(false);
    }
  }

  async function salir(id: string) {
    setMensaje(null);
    setSaliendoId(id);
    try {
      await casosDeUso.salirListaEspera.ejecutar(id);
      setMensaje({ tono: "exito", texto: "Saliste de la lista de espera." });
      inscripciones.recargar();
    } catch (e) {
      setMensaje({ tono: "error", texto: mensajeDeError(e) });
    } finally {
      setSaliendoId(null);
    }
  }

  const lista = inscripciones.datos ?? [];

  return (
    <>
      <EncabezadoPagina
        titulo="Lista de espera"
        descripcion="Regístrate en la lista de un servicio y te avisaremos cuando se libere un turno."
      />

      {mensaje && (
        <div className="mb-4">
          <Alert tono={mensaje.tono}>{mensaje.texto}</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,22rem)]">
        <Card aria-labelledby="t-mis-listas">
          <CardTitulo id="t-mis-listas" descripcion="Se actualiza automáticamente cada 30 segundos.">
            Mis listas de espera
          </CardTitulo>

          {inscripciones.cargando && !inscripciones.datos ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-6" />
            </div>
          ) : inscripciones.error && !inscripciones.datos ? (
            <Alert tono="error">{inscripciones.error}</Alert>
          ) : lista.length === 0 ? (
            <EstadoVacio titulo="No estás en ninguna lista de espera" icono={<Clock3 className="size-5" />}>
              Elige una sede y un servicio para registrarte.
            </EstadoVacio>
          ) : (
            <ul className="grid gap-3">
              {lista.map((entrada) => (
                <li key={entrada.id} className="rounded-xl border border-borde p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Pildora tono="neutro" icono={<Clock3 className="size-3.5" aria-hidden="true" />}>
                        En espera
                      </Pildora>
                      <p className="mt-2 flex items-center gap-2 text-lg text-titulo">
                        <Stethoscope className="size-4 shrink-0 text-cerceta" aria-hidden="true" />
                        {nombreServicio.get(entrada.servicioId) ?? "Servicio"}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-tinta-tenue">
                        <MapPin className="size-4 shrink-0" aria-hidden="true" />
                        {nombrePunto.get(entrada.puntoId) ?? "Sede"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-neutro px-4 py-3 text-right">
                      <p className="text-xs font-bold text-tinta">Tu posición en la lista</p>
                      <p className="text-4xl text-titulo">{entrada.posicion}</p>
                      <p className="text-xs text-tinta-tenue">
                        {entrada.posicion <= 1
                          ? "Eres el siguiente."
                          : `Hay ${entrada.posicion - 1} ${entrada.posicion - 1 === 1 ? "persona" : "personas"} antes de ti.`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm text-tinta-tenue">
                      <Bell className="size-4" aria-hidden="true" />
                      Te notificaremos cuando se libere un cupo.
                    </p>
                    <Button
                      variante="secundario"
                      tamano="sm"
                      cargando={saliendoId === entrada.id}
                      onClick={() => void salir(entrada.id)}
                      icono={<LogOut className="size-4" aria-hidden="true" />}
                    >
                      Salir de la lista
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card aria-labelledby="t-unirme">
          <CardTitulo id="t-unirme" descripcion="Elige dónde y para qué servicio quieres esperar.">
            Unirme a una lista
          </CardTitulo>
          <div className="grid gap-4">
            <Select etiqueta="Entidad médica" value={entidadId} onChange={(e) => elegirEntidad(e.target.value)}>
              <option value="">{catalogo.cargandoEntidades ? "Cargando…" : "Selecciona una entidad"}</option>
              {catalogo.entidades.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </Select>
            <Select
              etiqueta="Sede"
              value={puntoId}
              disabled={!entidadId || catalogo.cargandoPuntos}
              onChange={(e) => setPuntoId(e.target.value)}
            >
              <option value="">Selecciona una sede</option>
              {catalogo.puntos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombreSede} · {p.ciudad}
                </option>
              ))}
            </Select>
            <Select
              etiqueta="Servicio"
              value={servicioId}
              disabled={!entidadId || catalogo.cargandoServicios}
              onChange={(e) => setServicioId(e.target.value)}
            >
              <option value="">Selecciona un servicio</option>
              {catalogo.servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </Select>
            {catalogo.error && <Alert tono="error">{catalogo.error}</Alert>}
            <Button
              cargando={enviando}
              disabled={!puntoId || !servicioId}
              onClick={() => void unirse()}
              icono={<ListPlus className="size-4" aria-hidden="true" />}
            >
              Unirme a la lista
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
