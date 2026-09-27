import type { Metadata } from "next";
import { TablaTurnosServicio } from "@/presentation/components/fila/tabla-turnos-servicio";

export const metadata: Metadata = { title: "Historial de la cola" };

export default function HistorialColaPage() {
  return (
    <TablaTurnosServicio
      titulo="Historial"
      descripcion="Todos los turnos del servicio seleccionado, en cualquier estado."
      estados={["PENDIENTE", "EN_CURSO", "ATENDIDO", "CANCELADO"]}
    />
  );
}
