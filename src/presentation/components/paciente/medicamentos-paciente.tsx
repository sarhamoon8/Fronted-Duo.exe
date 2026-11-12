"use client";

import { useMemo, useState } from "react";
import { CircleCheck, FileCheck, Hospital, Pill, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  NIVEL_ETIQUETA,
  nivelDisponibilidad,
  type NivelDisponibilidad,
  type ExistenciaMedicamento,
} from "@/core/domain/entities/medicamento";
import { casosDeUso } from "@/infrastructure/container";
import { useRecurso } from "@/presentation/hooks/use-recurso";
import { Alert } from "@/presentation/components/ui/alert";
import { Card, CardTitulo, EncabezadoPagina, Pildora } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Input, Select } from "@/presentation/components/ui/field";
import { Spinner } from "@/presentation/components/ui/spinner";

const TONO: Record<NivelDisponibilidad, "menta" | "ambar" | "rojo"> = { DISPONIBLE: "menta", BAJA: "ambar", AGOTADO: "rojo" };
const ICONO: Record<NivelDisponibilidad, React.ReactNode> = {
  DISPONIBLE: <CircleCheck className="size-[13px]" aria-hidden="true" />,
  BAJA: <TriangleAlert className="size-[13px]" aria-hidden="true" />,
  AGOTADO: <TriangleAlert className="size-[13px]" aria-hidden="true" />,
};

function unidades(existencias: ExistenciaMedicamento[] | undefined) {
  return (existencias ?? []).reduce((total, e) => total + Math.max(e.cantidadDisponible, 0), 0);
}

/**
 * Catálogo de medicamentos con su disponibilidad por sede, a partir del
 * catálogo (GET /medicamentos) y del inventario de cada sede (GET /inventario).
 * La reserva y las fórmulas todavía no existen en el backend.
 */
export function MedicamentosPaciente() {
  const [sedeId, setSedeId] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const { datos, cargando, error } = useRecurso(
    "medicamentos-disponibilidad",
    async () => {
      const [medicamentos, puntos] = await Promise.all([
        casosDeUso.listarMedicamentos.ejecutar(),
        casosDeUso.listarPuntos.ejecutar(),
      ]);
      const existencias = await Promise.all(puntos.map((p) => casosDeUso.consultarExistencias.ejecutar(p.id)));
      return { medicamentos, puntos, existencias: new Map(puntos.map((p, i) => [p.id, existencias[i]!])) };
    },
    { intervaloMs: 60_000 },
  );

  const puntos = useMemo(() => datos?.puntos ?? [], [datos]);
  const sedeActiva = sedeId || puntos[0]?.id || "";

  const filas = useMemo(() => {
    if (!datos) return [];
    const termino = busqueda.trim().toLowerCase();
    return datos.medicamentos
      .filter((m) => !termino || `${m.nombreGenerico} ${m.laboratorioFabricante}`.toLowerCase().includes(termino))
      .map((m) => {
        const porSede = puntos.map((p) => ({
          punto: p,
          cantidad: unidades(datos.existencias.get(p.id)?.filter((e) => e.medicamentoId === m.id)),
        }));
        const enSede = porSede.find((s) => s.punto.id === sedeActiva)?.cantidad ?? 0;
        return { medicamento: m, enSede, sedesConStock: porSede.filter((s) => s.cantidad > 0).length };
      });
  }, [datos, busqueda, puntos, sedeActiva]);

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <EncabezadoPagina
        className="mb-0"
        titulo="Medicamentos"
        descripcion="Consulta la disponibilidad en cada sede antes de desplazarte."
      />

      <Alert tono="info" titulo="Consulta de disponibilidad" icono={<ShieldCheck className="size-5" />}>
        Las existencias se actualizan con el inventario de cada sede. La entrega está sujeta a validación de la
        fórmula, la afiliación y el documento de identidad.
      </Alert>

      <Card aria-labelledby="t-disponibilidad">
        <CardTitulo id="t-disponibilidad" descripcion="Elige una sede y busca por nombre o laboratorio.">
          Disponibilidad por sede
        </CardTitulo>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <Select etiqueta="Sede" value={sedeActiva} onChange={(e) => setSedeId(e.target.value)} disabled={puntos.length === 0}>
            {puntos.length === 0 && <option value="">Sin sedes</option>}
            {puntos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombreSede} · {p.ciudad}
              </option>
            ))}
          </Select>
          <Input
            etiqueta="Buscar medicamento"
            type="search"
            placeholder="Ej.: losartán"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            autoComplete="off"
          />
        </div>

        {cargando && !datos ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        ) : error && !datos ? (
          <Alert tono="error">{error}</Alert>
        ) : filas.length === 0 ? (
          <EstadoVacio titulo="No encontramos medicamentos" icono={<Search className="size-5" />}>
            Prueba con otro nombre o cambia de sede.
          </EstadoVacio>
        ) : (
          <ul className="grid gap-3">
            {filas.map(({ medicamento: m, enSede, sedesConStock }) => {
              const nivel = nivelDisponibilidad(enSede);
              return (
                <li key={m.id} className="flex flex-col gap-3 rounded-2xl border border-borde p-4 sm:p-[18px]">
                  <div className="flex items-start gap-3.5">
                    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-aqua text-cerceta-oscuro">
                      <Pill className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base text-titulo">
                        {m.nombreGenerico} {m.concentracion}
                      </p>
                      <p className="mt-0.5 text-xs text-tinta-tenue">
                        {m.presentacion} · {m.laboratorioFabricante}
                      </p>
                    </div>
                    <Pildora tono={TONO[nivel]} icono={ICONO[nivel]}>
                      {NIVEL_ETIQUETA[nivel]}
                    </Pildora>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-borde pt-3 text-xs">
                    <span className="text-tinta">
                      <strong className="text-cerceta-oscuro">{enSede}</strong> unidades en esta sede
                    </span>
                    <span className="flex items-center gap-1.5 text-cerceta-oscuro">
                      <Hospital className="size-4" aria-hidden="true" />
                      {sedesConStock} de {puntos.length} {puntos.length === 1 ? "sede" : "sedes"} con existencias
                    </span>
                    {m.requiereAutorizacion && (
                      <Pildora tono="ambar" icono={<FileCheck className="size-[13px]" aria-hidden="true" />}>
                        Requiere autorización
                      </Pildora>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
