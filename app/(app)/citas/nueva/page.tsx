import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { AgendarCita } from "@/presentation/components/paciente/agendar-cita";

export const metadata: Metadata = { title: "Pedir una cita" };

export default function NuevaCitaPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Portal del paciente",
        titulo: "Pedir una cita",
        descripcion: "Elige sede, especialidad y hora.",
      }}
    >
      <AgendarCita />
    </Pagina>
  );
}
