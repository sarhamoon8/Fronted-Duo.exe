import type { Metadata } from "next";
import { PaginaLegal } from "@/presentation/components/layout/pagina-legal";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacidadPage() {
  return (
    <PaginaLegal titulo="Política de privacidad">
      <section>
        <h2>Qué datos usamos</h2>
        <p>
          Al crear tu cuenta guardamos tu tipo y número de documento, nombres, apellidos, correo electrónico y, si
          quieres, tu teléfono. Tu contraseña se almacena cifrada.
        </p>
      </section>
      <section>
        <h2>Para qué los usamos</h2>
        <p>
          Para identificarte, gestionar tus turnos y citas, y enviarte avisos sobre ellos (por ejemplo, cuando tu turno
          es llamado o tu cita se reprograma).
        </p>
      </section>
      <section>
        <h2>Tus derechos</h2>
        <p>
          Puedes eliminar tu cuenta desde la aplicación. Al marcar la casilla de
          aceptación autorizas este tratamiento de tus datos personales.
        </p>
      </section>
    </PaginaLegal>
  );
}
