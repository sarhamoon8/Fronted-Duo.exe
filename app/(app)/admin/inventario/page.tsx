import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { InventarioAdmin } from "@/presentation/components/admin/inventario-admin";

export const metadata: Metadata = { title: "Inventario" };

export default function InventarioPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Red Pública de Salud",
        titulo: "Inventario",
        descripcion: "Existencias de medicamentos por sede.",
        enServicio: true,
      }}
    >
      <InventarioAdmin />
    </Pagina>
  );
}
