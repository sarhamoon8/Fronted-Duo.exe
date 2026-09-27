import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { MedicamentosPaciente } from "@/presentation/components/paciente/medicamentos-paciente";

export const metadata: Metadata = { title: "Mis medicamentos" };

export default function MedicamentosPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Fórmula médica",
        titulo: "Mis medicamentos",
        descripcion: "Consulta disponibilidad por sede y reserva antes de desplazarte.",
      }}
    >
      <MedicamentosPaciente />
    </Pagina>
  );
}
