import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { PanelAdmin } from "@/presentation/components/admin/panel-admin";
import { EncabezadoPagina } from "@/presentation/components/ui/card";

export const metadata: Metadata = { title: "Servicios" };

export default function ServiciosPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Administración",
        titulo: "Servicios y sedes",
        descripcion: "Registra sedes, servicios y personal de atención.",
        enServicio: true,
      }}
    >
      <EncabezadoPagina titulo="Gestionar servicios" descripcion="Todo lo que crees aquí queda disponible de inmediato para pacientes y personal." />
      <PanelAdmin />
    </Pagina>
  );
}
