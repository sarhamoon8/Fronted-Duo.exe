"use client";

import { ListChecks } from "lucide-react";
import type { EstadoTurno } from "@/core/domain/entities/turno";
import { codigoCorto } from "@/core/domain/entities/turno";
import { useCola } from "@/presentation/hooks/use-cola";
import { formatearFechaHora } from "@/presentation/lib/cn";
import { Pagina } from "@/presentation/components/layout/pagina";
import { Alert } from "@/presentation/components/ui/alert";
import { BadgeEstadoTurno } from "@/presentation/components/ui/badge";
import { Card, CardTitulo, EncabezadoPagina } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Spinner } from "@/presentation/components/ui/spinner";
import { SelectorPuesto } from "./selector-puesto";

/** Tabla de turnos del servicio filtrada por estados (atendidos / historial). */
export function TablaTurnosServicio({
  titulo,
  descripcion,
  estados,
}: {
  titulo: string;
  descripcion: string;
  estados: EstadoTurno[];
}) {
  const cola = useCola();
  const turnos = (cola.fila?.turnos ?? []).filter((t) => estados.includes(t.estado)).reverse();

  return (
    <Pagina
      barra={{
        antetitulo: cola.entidad?.nombre ?? "Personal de atención",
        titulo,
        descripcion: cola.servicio ? `Módulo de ${cola.servicio.nombre.toLowerCase()}` : "Selecciona tu puesto de atención",
        enServicio: true,
      }}
    >
      <EncabezadoPagina titulo={titulo} descripcion={descripcion} />
      <SelectorPuesto cola={cola} />
      {cola.errorFila && <Alert tono="error" titulo={cola.errorFila} className="mb-4" />}
      {!cola.puntoId ? (
        <EstadoVacio titulo="Selecciona una sede y un punto de atención" icono={<ListChecks className="size-5" />} />
      ) : cola.cargandoFila ? (
        <Spinner etiqueta="Cargando turnos…" />
      ) : (
        <Card aria-labelledby="t-tabla">
          <CardTitulo id="t-tabla" descripcion={`${turnos.length} turnos · más recientes primero`}>{cola.servicio?.nombre}</CardTitulo>
          {turnos.length === 0 ? (
            <EstadoVacio titulo="No hay turnos para mostrar" />
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <caption className="sr-only">{titulo}</caption>
                <thead className="bg-neutro text-[11px] uppercase tracking-wider text-tinta-tenue">
                  <tr>
                    <th scope="col" className="rounded-l-lg px-4 py-2.5 font-semibold">Turno</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Paciente</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Solicitado</th>
                    <th scope="col" className="rounded-r-lg px-4 py-2.5 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {turnos.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 font-mono font-semibold text-cerceta-oscuro">{codigoCorto(t.id)}</td>
                      <td className="px-4 py-3">{cola.nombrePaciente(t.usuarioId)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatearFechaHora(t.creadoEn)}</td>
                      <td className="px-4 py-3"><BadgeEstadoTurno estado={t.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </Pagina>
  );
}
