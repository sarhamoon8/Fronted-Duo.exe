import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { MedicamentosPaciente } from "@/presentation/components/paciente/medicamentos-paciente";

export const metadata: Metadata = { title: "Medicamentos" };

export default function MedicamentosPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Disponibilidad",
        titulo: "Medicamentos",
        descripcion: "Consulta la disponibilidad por sede antes de desplazarte.",
      }}
    >
      <MedicamentosPaciente />
    </Pagina>
  );
}
