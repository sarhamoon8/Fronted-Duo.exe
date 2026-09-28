"use client";

import { MapPin } from "lucide-react";
import type { ColaState } from "@/presentation/hooks/use-cola";
import { Alert } from "@/presentation/components/ui/alert";
import { Select } from "@/presentation/components/ui/field";

/** Selección del puesto de atención (sede + punto + servicio + ventanilla), se recuerda en la pestaña. */
export function SelectorPuesto({ cola }: { cola: ColaState }) {
  return (
    <div className="mb-6 rounded-2xl border border-borde bg-superficie p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-tinta">
        <MapPin className="size-4 text-cerceta-profundo" aria-hidden="true" /> Puesto de atención
      </p>
      {cola.error && <Alert tono="error" titulo="No se pudo cargar el catálogo" className="mb-3">{cola.error}</Alert>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select etiqueta="Sede" value={cola.entidadId} onChange={(e) => cola.setEntidad(e.target.value)} disabled={cola.cargandoEntidades}>
          <option value="">Selecciona una sede</option>
          {cola.entidades.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </Select>
        <Select etiqueta="Punto de atención" value={cola.puntoId} onChange={(e) => cola.setPunto(e.target.value)} disabled={!cola.entidadId || cola.cargandoPuntos}>
          <option value="">{cola.cargandoPuntos ? "Cargando…" : "Selecciona un punto"}</option>
          {cola.puntos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombreSede}</option>
          ))}
        </Select>
        <Select etiqueta="Servicio (opcional)" value={cola.servicioId} onChange={(e) => cola.setServicio(e.target.value)} disabled={!cola.puntoId || cola.cargandoServicios}>
          <option value="">{cola.cargandoServicios ? "Cargando…" : "Todos los servicios del punto"}</option>
          {cola.servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </Select>
        <Select etiqueta="Tu ventanilla" value={cola.ventanillaId} onChange={(e) => cola.setVentanilla(e.target.value)} disabled={!cola.puntoId || cola.cargandoVentanillas}>
          <option value="">{cola.cargandoVentanillas ? "Cargando…" : "Selecciona tu ventanilla"}</option>
          {cola.ventanillas.map((v) => (
            <option key={v.id} value={v.id} disabled={v.estadoOperativo !== "ACTIVA"}>
              {v.numeroModulo}{v.estadoOperativo !== "ACTIVA" ? " (inactiva)" : ""}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
