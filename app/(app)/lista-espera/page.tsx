import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { ListaEsperaPaciente } from "@/presentation/components/paciente/lista-espera";

export const metadata: Metadata = { title: "Lista de espera" };

export default function ListaEsperaPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Portal del paciente",
        titulo: "Lista de espera",
        descripcion: "Regístrate y consulta tu posición.",
      }}
    >
      <ListaEsperaPaciente />
    </Pagina>
  );
}
