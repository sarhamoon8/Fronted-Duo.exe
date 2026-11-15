import type { Metadata } from "next";
import { PaginaLegal } from "@/presentation/components/layout/pagina-legal";

export const metadata: Metadata = { title: "Términos de uso" };

export default function TerminosPage() {
  return (
    <PaginaLegal titulo="Términos de uso">
      <section>
        <h2>Qué es FilaCero</h2>
        <p>
          FilaCero te permite solicitar turnos virtuales, agendar citas, seguir tu posición en la fila y consultar la
          disponibilidad de medicamentos en las sedes de tu EPS o centro médico.
        </p>
      </section>
      <section>
        <h2>Tu cuenta</h2>
        <p>
          Eres responsable de los datos que registras y de mantener segura tu contraseña. Las cuentas nuevas se crean
          como paciente; el personal de atención lo registra un administrador.
        </p>
      </section>
      <section>
        <h2>Uso adecuado</h2>
        <p>
          Usa los turnos y las citas solo para tu propia atención y cancélalos si ya no los necesitas, para que otra
          persona pueda tomarlos.
        </p>
      </section>
      <section>
        <h2>Alcance</h2>
        <p>FilaCero no diagnostica ni reemplaza la atención médica.</p>
      </section>
    </PaginaLegal>
  );
}
