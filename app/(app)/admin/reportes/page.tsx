import type { Metadata } from "next";
import { BarChart3, Clock3, FileSpreadsheet, Package, Users } from "lucide-react";
import { Pagina } from "@/presentation/components/layout/pagina";
import { Button } from "@/presentation/components/ui/button";
import { EncabezadoPagina, MarcaDemo } from "@/presentation/components/ui/card";

export const metadata: Metadata = { title: "Reportes" };

const REPORTES = [
  { icono: BarChart3, titulo: "Turnos por sede", texto: "Emitidos, atendidos y cancelados por sede y día." },
  { icono: Clock3, titulo: "Tiempos de espera", texto: "Espera promedio y cumplimiento de la meta por servicio." },
  { icono: Package, titulo: "Inventario y reservas", texto: "Cobertura, agotados y reservas vencidas." },
  { icono: Users, titulo: "Productividad del personal", texto: "Turnos atendidos por funcionario y ventanilla." },
];

export default function ReportesPage() {
  return (
    <Pagina
      barra={{
        antetitulo: "Red Pública de Salud",
        titulo: "Reportes",
        descripcion: "Descarga informes consolidados de la operación.",
        enServicio: true,
      }}
    >
      <EncabezadoPagina titulo="Reportes" descripcion="Selecciona un informe para generarlo." acciones={<MarcaDemo />} />
      <ul className="grid gap-4 md:grid-cols-2">
        {REPORTES.map(({ icono: Icono, titulo, texto }) => (
          <li key={titulo} className="flex flex-col rounded-2xl border border-borde bg-superficie p-5">
            <span aria-hidden="true" className="mb-3 flex size-10 items-center justify-center rounded-xl bg-aqua text-cerceta-profundo">
              <Icono className="size-5" />
            </span>
            <h2 className="font-semibold">{titulo}</h2>
            <p className="mb-4 mt-1 text-sm text-tinta-tenue">{texto}</p>
            <Button variante="secundario" className="mt-auto self-start" icono={<FileSpreadsheet className="size-4" aria-hidden="true" />}>
              Generar reporte
            </Button>
          </li>
        ))}
      </ul>
    </Pagina>
  );
}
