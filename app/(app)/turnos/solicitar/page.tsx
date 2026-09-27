import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { SolicitarTurno } from "@/presentation/components/turnos/solicitar-turno";

export const metadata: Metadata = { title: "Solicitar turno" };

export default function SolicitarTurnoPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Turnos virtuales",
        titulo: "Solicitar un turno",
        descripcion: "Selecciona dónde y para qué trámite necesitas atención.",
      }}
    >
      <SolicitarTurno />
    </Pagina>
  );
}
