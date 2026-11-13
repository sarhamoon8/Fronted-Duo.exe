import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { AgendarCita } from "@/presentation/components/paciente/agendar-cita";

export const metadata: Metadata = { title: "Pedir una cita" };

export default async function NuevaCitaPage({ searchParams }: { searchParams: Promise<{ reprogramar?: string }> }) {
  const { reprogramar } = await searchParams;
  return (
    <Pagina
      barra={{
        antetitulo: "Portal del paciente",
        titulo: reprogramar ? "Reprogramar cita" : "Pedir una cita",
        descripcion: reprogramar ? "Elige la nueva hora." : "Elige sede, especialidad y hora.",
      }}
    >
      <AgendarCita reprogramarId={reprogramar} />
    </Pagina>
  );
}
