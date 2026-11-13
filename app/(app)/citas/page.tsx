import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { MisCitas } from "@/presentation/components/paciente/mis-citas";

export const metadata: Metadata = { title: "Mis citas" };

export default function CitasPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Portal del paciente",
        titulo: "Mis citas",
        descripcion: "Tus citas médicas y el doctor asignado.",
      }}
    >
      <MisCitas />
    </Pagina>
  );
}
