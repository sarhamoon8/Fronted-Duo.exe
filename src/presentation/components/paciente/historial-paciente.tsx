"use client";

import { History, Plus } from "lucide-react";
import { codigoTurno } from "@/core/domain/entities/turno";
import { useMisTurnos } from "@/presentation/hooks/use-mis-turnos";
import { formatearFechaHora } from "@/presentation/lib/cn";
import { BadgeEstadoTurno } from "@/presentation/components/ui/badge";
import { BotonEnlace } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Alert } from "@/presentation/components/ui/alert";
import { Spinner } from "@/presentation/components/ui/spinner";

export function HistorialPaciente() {
  const { turnos, cargando, error } = useMisTurnos();

  return (
    <>
      <EncabezadoPagina
        titulo="Historial de turnos"
        descripcion="Todos los turnos que has solicitado."
        acciones={<BotonEnlace href="/turnos/solicitar" icono={<Plus className="size-4" aria-hidden="true" />}>Solicitar nuevo turno</BotonEnlace>}
      />
      <Card aria-labelledby="t-hist">
        <CardTitulo id="t-hist" descripcion={!cargando && !error ? `${turnos.length} turnos registrados` : undefined}>Tus turnos</CardTitulo>
        {cargando ? (
          <Spinner etiqueta="Cargando tu historial…" />
        ) : error ? (
          <Alert tono="error" titulo="No se pudo cargar tu historial">{error}</Alert>
        ) : turnos.length === 0 ? (
          <EstadoVacio titulo="Todavía no tienes turnos" icono={<History className="size-5" />} />
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Historial de turnos</caption>
              <thead className="bg-neutro text-[11px] uppercase tracking-wider text-tinta-tenue">
                <tr>
                  <th scope="col" className="rounded-l-lg px-4 py-2.5 font-semibold">Turno</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Sede</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Servicio</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Solicitado</th>
                  <th scope="col" className="rounded-r-lg px-4 py-2.5 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {turnos.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-cerceta-oscuro">{codigoTurno(t)}</td>
                    <td className="px-4 py-3">{t.entidadNombre}</td>
                    <td className="px-4 py-3">{t.servicioNombre}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatearFechaHora(t.creadoEn)}</td>
                    <td className="px-4 py-3"><BadgeEstadoTurno estado={t.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
