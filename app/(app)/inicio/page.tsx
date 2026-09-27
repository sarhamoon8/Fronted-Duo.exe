import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obtenerSesionServidor } from "@/server/session";
import { INICIO_POR_ROL } from "@/presentation/components/layout/navegacion";
import { Pagina } from "@/presentation/components/layout/pagina";
import { DashboardPaciente } from "@/presentation/components/paciente/dashboard-paciente";
import { Alert } from "@/presentation/components/ui/alert";
import { saludo } from "@/presentation/lib/cn";

export const metadata: Metadata = { title: "Inicio" };

export default async function InicioPage({ searchParams }: PageProps<"/inicio">) {
  const sesion = (await obtenerSesionServidor())!;
  if (sesion.rol !== "PACIENTE") redirect(INICIO_POR_ROL[sesion.rol]);
  const { sinPermiso } = await searchParams;
  const primerNombre = sesion.nombre.split(" ")[0];

  return (
    <Pagina
      barra={{
        antetitulo: "Portal del paciente",
        titulo: `${saludo()}, ${primerNombre}`,
        descripcion: "Gestiona tus turnos, citas y medicamentos desde un solo lugar.",
      }}
    >
      {sinPermiso && (
        <Alert tono="error" titulo="No tienes permisos para esa sección" className="mb-6">
          Tu rol no permite acceder a la página solicitada.
        </Alert>
      )}
      <DashboardPaciente />
    </Pagina>
  );
}
