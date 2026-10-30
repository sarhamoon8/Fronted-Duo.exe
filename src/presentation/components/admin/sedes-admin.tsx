"use client";

import { useState, type FormEvent } from "react";
import { Building2, MapPin, Phone, Plus, Users } from "lucide-react";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useRecurso } from "@/presentation/hooks/use-recurso";
import { Alert } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina, Pildora } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Input, Select } from "@/presentation/components/ui/field";
import { Spinner } from "@/presentation/components/ui/spinner";

const SEDE_VACIA = { entidadId: "", nombreSede: "", direccion: "", ciudad: "", telefonoContacto: "", capacidadAtencion: "" };

/** Administración de sedes (puntos de dispensación) y de sus ventanillas. */
export function SedesAdmin() {
  const [sede, setSede] = useState(SEDE_VACIA);
  const [puntoVentanilla, setPuntoVentanilla] = useState("");
  const [modulo, setModulo] = useState("");
  const [guardando, setGuardando] = useState<"sede" | "ventanilla" | null>(null);
  const [mensaje, setMensaje] = useState<{ tono: "exito" | "error"; texto: string } | null>(null);

  const { datos, cargando, error, recargar } = useRecurso("sedes-admin", async () => {
    const [entidades, puntos] = await Promise.all([casosDeUso.listarEntidades.ejecutar(), casosDeUso.listarPuntos.ejecutar()]);
    const ventanillas = await Promise.all(puntos.map((p) => casosDeUso.listarVentanillas.ejecutar(p.id)));
    return { entidades, puntos, ventanillas: new Map(puntos.map((p, i) => [p.id, ventanillas[i]!])) };
  });

  async function crearSede(e: FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setGuardando("sede");
    try {
      const creada = await casosDeUso.crearPunto.ejecutar({
        entidadId: sede.entidadId,
        nombreSede: sede.nombreSede,
        direccion: sede.direccion,
        ciudad: sede.ciudad,
        telefonoContacto: sede.telefonoContacto.trim() || undefined,
        capacidadAtencion: Number(sede.capacidadAtencion),
      });
      setMensaje({ tono: "exito", texto: `Sede «${creada.nombreSede}» registrada.` });
      setSede(SEDE_VACIA);
      recargar();
    } catch (err) {
      setMensaje({ tono: "error", texto: mensajeDeError(err) });
    } finally {
      setGuardando(null);
    }
  }

  async function crearVentanilla(e: FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setGuardando("ventanilla");
    try {
      const creada = await casosDeUso.crearVentanilla.ejecutar(puntoVentanilla, modulo);
      setMensaje({ tono: "exito", texto: `Ventanilla ${creada.numeroModulo} registrada.` });
      setModulo("");
      recargar();
    } catch (err) {
      setMensaje({ tono: "error", texto: mensajeDeError(err) });
    } finally {
      setGuardando(null);
    }
  }

  const entidades = datos?.entidades ?? [];
  const puntos = datos?.puntos ?? [];

  return (
    <>
      <EncabezadoPagina
        titulo="Sedes y ventanillas"
        descripcion="Registra los puntos de dispensación y los módulos de atención de cada sede."
      />

      {mensaje && (
        <div className="mb-4">
          <Alert tono={mensaje.tono}>{mensaje.texto}</Alert>
        </div>
      )}
      {error && !datos && (
        <div className="mb-4">
          <Alert tono="error">{error}</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card aria-labelledby="t-nueva-sede">
          <CardTitulo id="t-nueva-sede" descripcion="Queda disponible de inmediato para solicitar turnos.">
            Nueva sede
          </CardTitulo>
          <form onSubmit={crearSede} className="grid gap-4">
            <Select etiqueta="Entidad médica" value={sede.entidadId} onChange={(e) => setSede((s) => ({ ...s, entidadId: e.target.value }))} required>
              <option value="">Selecciona una entidad</option>
              {entidades.map((en) => (
                <option key={en.id} value={en.id}>
                  {en.nombre}
                </option>
              ))}
            </Select>
            <Input etiqueta="Nombre de la sede" value={sede.nombreSede} onChange={(e) => setSede((s) => ({ ...s, nombreSede: e.target.value }))} placeholder="Ej.: Sede Chapinero" required />
            <Input etiqueta="Dirección" value={sede.direccion} onChange={(e) => setSede((s) => ({ ...s, direccion: e.target.value }))} placeholder="Ej.: Cra 13 # 53-44" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input etiqueta="Ciudad" value={sede.ciudad} onChange={(e) => setSede((s) => ({ ...s, ciudad: e.target.value }))} required />
              <Input etiqueta="Teléfono (opcional)" type="tel" value={sede.telefonoContacto} onChange={(e) => setSede((s) => ({ ...s, telefonoContacto: e.target.value }))} />
            </div>
            <Input
              etiqueta="Capacidad de atención"
              type="number"
              min={1}
              step={1}
              value={sede.capacidadAtencion}
              onChange={(e) => setSede((s) => ({ ...s, capacidadAtencion: e.target.value }))}
              ayuda="Personas que la sede puede atender a la vez."
              required
            />
            <Button type="submit" cargando={guardando === "sede"} icono={<Plus className="size-4" aria-hidden="true" />}>
              Registrar sede
            </Button>
          </form>
        </Card>

        <Card aria-labelledby="t-nueva-ventanilla">
          <CardTitulo id="t-nueva-ventanilla" descripcion="Cada ventanilla es un módulo desde donde llama el personal.">
            Nueva ventanilla
          </CardTitulo>
          <form onSubmit={crearVentanilla} className="grid gap-4">
            <Select etiqueta="Sede" value={puntoVentanilla} onChange={(e) => setPuntoVentanilla(e.target.value)} required>
              <option value="">Selecciona una sede</option>
              {puntos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombreSede} · {p.ciudad}
                </option>
              ))}
            </Select>
            <Input etiqueta="Número de módulo" value={modulo} onChange={(e) => setModulo(e.target.value)} placeholder="Ej.: M3" required />
            <Button type="submit" cargando={guardando === "ventanilla"} icono={<Plus className="size-4" aria-hidden="true" />}>
              Registrar ventanilla
            </Button>
          </form>
        </Card>
      </div>

      <Card aria-labelledby="t-sedes" className="mt-5">
        <CardTitulo id="t-sedes" descripcion={`${puntos.length} ${puntos.length === 1 ? "sede registrada" : "sedes registradas"}.`}>
          Sedes registradas
        </CardTitulo>
        {cargando && !datos ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : puntos.length === 0 ? (
          <EstadoVacio titulo="Aún no hay sedes" icono={<Building2 className="size-5" />}>
            Registra la primera sede con el formulario.
          </EstadoVacio>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {puntos.map((p) => {
              const ventanillas = datos?.ventanillas.get(p.id) ?? [];
              return (
                <li key={p.id} className="rounded-xl border border-borde p-4">
                  <p className="text-base text-titulo">{p.nombreSede}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-tinta-tenue">
                    <MapPin className="size-4 shrink-0" aria-hidden="true" />
                    {p.direccion} · {p.ciudad}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-tinta-tenue">
                    {p.telefonoContacto && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-4" aria-hidden="true" />
                        {p.telefonoContacto}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4" aria-hidden="true" />
                      Capacidad {p.capacidadAtencion}
                    </span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ventanillas.length === 0 ? (
                      <span className="text-xs text-tinta-tenue">Sin ventanillas registradas.</span>
                    ) : (
                      ventanillas.map((v) => (
                        <Pildora key={v.id} tono={v.estadoOperativo === "ACTIVA" ? "menta" : "neutro"}>
                          {v.numeroModulo} · {v.estadoOperativo === "ACTIVA" ? "Activa" : "Inactiva"}
                        </Pildora>
                      ))
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
