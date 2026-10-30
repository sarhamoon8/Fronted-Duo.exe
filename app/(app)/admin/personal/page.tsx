import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { PersonalAdmin } from "@/presentation/components/admin/personal-admin";

export const metadata: Metadata = { title: "Personal" };

export default function PersonalPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Administración",
        titulo: "Gestión de personal",
        descripcion: "Cuentas del personal de atención.",
        enServicio: true,
      }}
    >
      <PersonalAdmin />
    </Pagina>
  );
}
