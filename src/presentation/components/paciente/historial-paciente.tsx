"use client";

import { History, Plus } from "lucide-react";
import { codigoCorto } from "@/core/domain/entities/turno";
import { useMontado } from "@/presentation/hooks/use-montado";
import { formatearFechaHora } from "@/presentation/lib/cn";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { useMisTurnos, useTurnosStore } from "@/presentation/stores/turnos.store";
import { BadgeEstadoTurno } from "@/presentation/components/ui/badge";
import { BotonEnlace, Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";

export function HistorialPaciente() {
  const usuario = useSesionStore((s) => s.usuario);
  const turnos = useMisTurnos(usuario?.id);
  const quitar = useTurnosStore((s) => s.quitar);
  const montado = useMontado();

  return (
    <>
      <EncabezadoPagina
        titulo="Historial de turnos"
        descripcion="Los turnos que has solicitado desde este dispositivo."
        acciones={<BotonEnlace href="/turnos/solicitar" icono={<Plus className="size-4" aria-hidden="true" />}>Solicitar nuevo turno</BotonEnlace>}
      />
      <Card aria-labelledby="t-hist">
        <CardTitulo id="t-hist" descripcion={montado ? `${turnos.length} turnos registrados` : undefined}>Tus turnos</CardTitulo>
        {!montado ? null : turnos.length === 0 ? (
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
                  <th scope="col" className="px-4 py-2.5 font-semibold">Estado</th>
                  <th scope="col" className="rounded-r-lg px-4 py-2.5"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {turnos.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-cerceta-oscuro">{codigoCorto(t.id)}</td>
                    <td className="px-4 py-3">{t.entidadNombre}</td>
                    <td className="px-4 py-3">{t.servicioNombre}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatearFechaHora(t.creadoEn)}</td>
                    <td className="px-4 py-3"><BadgeEstadoTurno estado={t.estado} /></td>
                    <td className="px-4 py-3 text-right">
                      {(t.estado === "ATENDIDO" || t.estado === "CANCELADO") && (
                        <Button variante="fantasma" tamano="sm" onClick={() => quitar(t.usuarioId, t.id)} aria-label={`Quitar ${codigoCorto(t.id)} del historial`}>
                          Quitar
                        </Button>
                      )}
                    </td>
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
