import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { SedesAdmin } from "@/presentation/components/admin/sedes-admin";

export const metadata: Metadata = { title: "Sedes y ventanillas" };

export default function SedesPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Administración",
        titulo: "Sedes y ventanillas",
        descripcion: "Puntos de dispensación y módulos de atención.",
        enServicio: true,
      }}
    >
      <SedesAdmin />
    </Pagina>
  );
}
