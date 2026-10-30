"use client";

import { useMemo, useState, type FormEvent } from "react";
import { PackagePlus, Pill, Plus } from "lucide-react";
import { NIVEL_ETIQUETA, nivelDisponibilidad, type NivelDisponibilidad } from "@/core/domain/entities/medicamento";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useRecurso } from "@/presentation/hooks/use-recurso";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { Alert } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina, Pildora } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Input, Select } from "@/presentation/components/ui/field";
import { Spinner } from "@/presentation/components/ui/spinner";

const TONO: Record<NivelDisponibilidad, "menta" | "ambar" | "rojo"> = { DISPONIBLE: "menta", BAJA: "ambar", AGOTADO: "rojo" };

const MEDICAMENTO_VACIO = {
  codigoNacional: "",
  nombreGenerico: "",
  concentracion: "",
  presentacion: "",
  laboratorioFabricante: "",
  requiereAutorizacion: false,
};
const EXISTENCIA_VACIA = { puntoId: "", medicamentoId: "", lote: "", stockActual: "", fechaVencimiento: "" };

function fecha(d: Date) {
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

/** Inventario real por sede: existencias por lote, alta de medicamentos y registro de ingresos. */
export function InventarioAdmin() {
  const rol = useSesionStore((s) => s.usuario?.rol);
  const [sedeId, setSedeId] = useState("");
  const [medicamento, setMedicamento] = useState(MEDICAMENTO_VACIO);
  const [existencia, setExistencia] = useState(EXISTENCIA_VACIA);
  const [guardando, setGuardando] = useState<"medicamento" | "existencia" | null>(null);
  const [mensaje, setMensaje] = useState<{ tono: "exito" | "error"; texto: string } | null>(null);

  const { datos, cargando, error, recargar } = useRecurso("inventario-admin", async () => {
    const [medicamentos, puntos] = await Promise.all([casosDeUso.listarMedicamentos.ejecutar(), casosDeUso.listarPuntos.ejecutar()]);
    const existencias = await Promise.all(puntos.map((p) => casosDeUso.consultarExistencias.ejecutar(p.id)));
    return { medicamentos, puntos, existencias: new Map(puntos.map((p, i) => [p.id, existencias[i]!])) };
  });

  const puntos = useMemo(() => datos?.puntos ?? [], [datos]);
  const medicamentos = useMemo(() => datos?.medicamentos ?? [], [datos]);
  const sedeActiva = sedeId || puntos[0]?.id || "";
  const nombreMedicamento = useMemo(
    () => new Map(medicamentos.map((m) => [m.id, `${m.nombreGenerico} ${m.concentracion}`])),
    [medicamentos],
  );
  const lotes = useMemo(
    () => [...(datos?.existencias.get(sedeActiva) ?? [])].sort((a, b) => (nombreMedicamento.get(a.medicamentoId) ?? "").localeCompare(nombreMedicamento.get(b.medicamentoId) ?? "")),
    [datos, sedeActiva, nombreMedicamento],
  );

  async function crearMedicamento(e: FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setGuardando("medicamento");
    try {
      const creado = await casosDeUso.crearMedicamento.ejecutar(medicamento);
      setMensaje({ tono: "exito", texto: `Medicamento «${creado.nombreGenerico}» agregado al catálogo.` });
      setMedicamento(MEDICAMENTO_VACIO);
      recargar();
    } catch (err) {
      setMensaje({ tono: "error", texto: mensajeDeError(err) });
    } finally {
      setGuardando(null);
    }
  }

  async function registrarExistencia(e: FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setGuardando("existencia");
    try {
      await casosDeUso.registrarExistencia.ejecutar({
        ...existencia,
        stockActual: Number(existencia.stockActual),
        fechaVencimiento: existencia.fechaVencimiento ? new Date(`${existencia.fechaVencimiento}T00:00:00`).toISOString() : "",
      });
      setMensaje({ tono: "exito", texto: "Ingreso de existencias registrado." });
      setExistencia(EXISTENCIA_VACIA);
      recargar();
    } catch (err) {
      setMensaje({ tono: "error", texto: mensajeDeError(err) });
    } finally {
      setGuardando(null);
    }
  }

  return (
    <>
      <EncabezadoPagina titulo="Inventario de medicamentos" descripcion="Existencias por sede y lote, tal como las ve el paciente." />

      {mensaje && (
        <div className="mb-4">
          <Alert tono={mensaje.tono}>{mensaje.texto}</Alert>
        </div>
      )}

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <Card aria-labelledby="t-ingreso">
          <CardTitulo id="t-ingreso" descripcion="Suma un lote al inventario de una sede.">
            Registrar ingreso
          </CardTitulo>
          <form onSubmit={registrarExistencia} className="grid gap-4">
            <Select etiqueta="Sede" value={existencia.puntoId} onChange={(e) => setExistencia((x) => ({ ...x, puntoId: e.target.value }))} required>
              <option value="">Selecciona una sede</option>
              {puntos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombreSede} · {p.ciudad}
                </option>
              ))}
            </Select>
            <Select etiqueta="Medicamento" value={existencia.medicamentoId} onChange={(e) => setExistencia((x) => ({ ...x, medicamentoId: e.target.value }))} required>
              <option value="">Selecciona un medicamento</option>
              {medicamentos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombreGenerico} {m.concentracion}
                </option>
              ))}
            </Select>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input etiqueta="Lote" value={existencia.lote} onChange={(e) => setExistencia((x) => ({ ...x, lote: e.target.value }))} placeholder="L-2026-01" required />
              <Input etiqueta="Unidades" type="number" min={0} step={1} value={existencia.stockActual} onChange={(e) => setExistencia((x) => ({ ...x, stockActual: e.target.value }))} required />
              <Input etiqueta="Vence" type="date" value={existencia.fechaVencimiento} onChange={(e) => setExistencia((x) => ({ ...x, fechaVencimiento: e.target.value }))} required />
            </div>
            <Button type="submit" cargando={guardando === "existencia"} icono={<PackagePlus className="size-4" aria-hidden="true" />}>
              Registrar ingreso
            </Button>
          </form>
        </Card>

        {rol === "ADMIN" && (
          <Card aria-labelledby="t-medicamento">
            <CardTitulo id="t-medicamento" descripcion="Agrega un medicamento nuevo al catálogo.">
              Nuevo medicamento
            </CardTitulo>
            <form onSubmit={crearMedicamento} className="grid gap-4 sm:grid-cols-2">
              <Input etiqueta="Código nacional" value={medicamento.codigoNacional} onChange={(e) => setMedicamento((m) => ({ ...m, codigoNacional: e.target.value }))} placeholder="CUM-1021" required />
              <Input etiqueta="Nombre genérico" value={medicamento.nombreGenerico} onChange={(e) => setMedicamento((m) => ({ ...m, nombreGenerico: e.target.value }))} required />
              <Input etiqueta="Concentración" value={medicamento.concentracion} onChange={(e) => setMedicamento((m) => ({ ...m, concentracion: e.target.value }))} placeholder="500 mg" required />
              <Input etiqueta="Presentación" value={medicamento.presentacion} onChange={(e) => setMedicamento((m) => ({ ...m, presentacion: e.target.value }))} placeholder="Tabletas, caja x 30" required />
              <div className="sm:col-span-2">
                <Input etiqueta="Laboratorio" value={medicamento.laboratorioFabricante} onChange={(e) => setMedicamento((m) => ({ ...m, laboratorioFabricante: e.target.value }))} required />
              </div>
              <label className="flex items-center gap-2.5 text-sm text-tinta sm:col-span-2">
                <input
                  type="checkbox"
                  checked={medicamento.requiereAutorizacion}
                  onChange={(e) => setMedicamento((m) => ({ ...m, requiereAutorizacion: e.target.checked }))}
                  className="size-[18px] accent-cerceta"
                />
                Requiere autorización especial
              </label>
              <div className="sm:col-span-2">
                <Button type="submit" cargando={guardando === "medicamento"} icono={<Plus className="size-4" aria-hidden="true" />}>
                  Agregar al catálogo
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      <Card aria-labelledby="t-existencias">
        <CardTitulo
          id="t-existencias"
          descripcion={`${lotes.length} ${lotes.length === 1 ? "lote" : "lotes"} en la sede elegida.`}
          acciones={
            <div className="w-full sm:w-72">
              <Select etiqueta="Sede" value={sedeActiva} onChange={(e) => setSedeId(e.target.value)} disabled={puntos.length === 0}>
                {puntos.length === 0 && <option value="">Sin sedes</option>}
                {puntos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombreSede} · {p.ciudad}
                  </option>
                ))}
              </Select>
            </div>
          }
        >
          Existencias por lote
        </CardTitulo>

        {cargando && !datos ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        ) : error && !datos ? (
          <Alert tono="error">{error}</Alert>
        ) : lotes.length === 0 ? (
          <EstadoVacio titulo="Esta sede aún no tiene existencias" icono={<Pill className="size-5" />}>
            Registra un ingreso para que aparezca aquí.
          </EstadoVacio>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[13px]">
              <caption className="sr-only">Existencias por lote en la sede</caption>
              <thead className="text-[11px] text-tinta-tenue">
                <tr className="bg-neutro">
                  <th scope="col" className="h-10 rounded-l-lg px-3.5 font-normal">MEDICAMENTO</th>
                  <th scope="col" className="px-3.5 font-normal">LOTE</th>
                  <th scope="col" className="px-3.5 text-right font-normal">DISPONIBLES</th>
                  <th scope="col" className="px-3.5 font-normal">VENCE</th>
                  <th scope="col" className="rounded-r-lg px-3.5 font-normal">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {lotes.map((l) => {
                  const nivel = nivelDisponibilidad(l.cantidadDisponible);
                  return (
                    <tr key={l.id} className="border-b border-borde text-tinta">
                      <td className="px-3.5 py-3 font-bold">{nombreMedicamento.get(l.medicamentoId) ?? "Medicamento"}</td>
                      <td className="px-3.5">{l.lote}</td>
                      <td className="px-3.5 text-right font-bold">{l.cantidadDisponible}</td>
                      <td className="px-3.5">{fecha(l.fechaVencimiento)}</td>
                      <td className="px-3.5">
                        <Pildora tono={TONO[nivel]}>{NIVEL_ETIQUETA[nivel]}</Pildora>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
