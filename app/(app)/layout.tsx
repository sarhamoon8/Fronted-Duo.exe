import { redirect } from "next/navigation";
import { obtenerSesionServidor } from "@/server/session";
import { AppShell } from "@/presentation/components/layout/app-shell";
import { SesionHydrator } from "@/presentation/components/layout/sesion-hydrator";

/**
 * Layout de las rutas autenticadas. proxy.ts ya filtró por cookie y rol;
 * aquí se confirma la sesión contra el backend (GET /usuarios/:id) y se
 * hidrata el store de Zustand.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sesion = await obtenerSesionServidor();
  if (!sesion) redirect("/login?expirada=1");

  return (
    <AppShell sesion={sesion}>
      <SesionHydrator sesion={sesion} />
      {children}
    </AppShell>
  );
}
