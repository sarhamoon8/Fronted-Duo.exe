import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { HistorialPaciente } from "@/presentation/components/paciente/historial-paciente";

export const metadata: Metadata = { title: "Historial" };

export default function HistorialPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Portal del paciente",
        titulo: "Historial",
        descripcion: "Tus turnos anteriores y su resultado.",
      }}
    >
      <HistorialPaciente />
    </Pagina>
  );
}
