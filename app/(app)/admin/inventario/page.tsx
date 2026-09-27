import type { Metadata } from "next";
import { Download, PackagePlus } from "lucide-react";
import { Pagina } from "@/presentation/components/layout/pagina";
import { ListaInventario } from "@/presentation/components/admin/resumen-operativo";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina, MarcaDemo } from "@/presentation/components/ui/card";

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
      <EncabezadoPagina
        titulo="Inventario de medicamentos"
        descripcion="Cobertura estimada según el consumo promedio de la red."
        acciones={
          <>
            <Button variante="secundario" icono={<Download className="size-4" aria-hidden="true" />}>Exportar</Button>
            <Button icono={<PackagePlus className="size-4" aria-hidden="true" />}>Registrar ingreso</Button>
          </>
        }
      />
      <Card aria-labelledby="t-critico">
        <CardTitulo id="t-critico" descripcion="Medicamentos con cobertura menor a 20 días." acciones={<MarcaDemo />}>
          Inventario crítico
        </CardTitulo>
        <ListaInventario />
      </Card>

    </Pagina>
  );
}
