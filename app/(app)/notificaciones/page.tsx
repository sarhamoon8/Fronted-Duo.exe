import type { Metadata } from "next";
import { Pagina } from "@/presentation/components/layout/pagina";
import { CentroNotificaciones } from "@/presentation/components/layout/centro-notificaciones";

export const metadata: Metadata = { title: "Notificaciones" };

export default function NotificacionesPage() {
  return (
    <Pagina barra={{ antetitulo: "Avisos", titulo: "Notificaciones", descripcion: "Avisos sobre tus turnos." }}>
      <CentroNotificaciones />
    </Pagina>
  );
}
