import type { Metadata } from "next";
import { TablaTurnosServicio } from "@/presentation/components/fila/tabla-turnos-servicio";

export const metadata: Metadata = { title: "Turnos atendidos" };

export default function AtendidosPage() {
  return (
    <TablaTurnosServicio
      titulo="Turnos atendidos"
      descripcion="Turnos finalizados o cancelados en el servicio seleccionado."
      estados={["ATENDIDO", "CANCELADO"]}
    />
  );
}
