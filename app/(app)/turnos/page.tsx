import type { Metadata } from "next";
import { Suspense } from "react";
import { Pagina } from "@/presentation/components/layout/pagina";
import { MisTurnos } from "@/presentation/components/turnos/mis-turnos";

export const metadata: Metadata = { title: "Mi turno" };

export default function TurnosPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Seguimiento en tiempo real",
        titulo: "Mi turno",
        descripcion: "Consulta el estado de tu turno y cuánto falta para tu atención.",
      }}
    >
      <Suspense>
        <MisTurnos />
      </Suspense>
    </Pagina>
  );
}
