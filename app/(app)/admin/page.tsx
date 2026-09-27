import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { ResumenOperativo } from "@/presentation/components/admin/resumen-operativo";

export const metadata: Metadata = { title: "Resumen operativo" };

export default function AdminPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Red Pública de Salud",
        titulo: "Resumen operativo",
        descripcion: "Indicadores consolidados de sedes, servicios e inventario.",
        enServicio: true,
      }}
    >
      <ResumenOperativo />
    </Pagina>
  );
}
