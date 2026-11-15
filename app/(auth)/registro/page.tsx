import type { Metadata } from "next";
import { Headset } from "lucide-react";
import { Card } from "@/presentation/components/ui/card";
import { RegistroForm } from "@/presentation/components/auth/registro-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <>
      <Card>
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="mb-6 mt-1 text-tinta-suave">
          Las cuentas nuevas se crean como paciente. El personal de atención lo registra un administrador.
        </p>
        <RegistroForm />
      </Card>
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-[13px] text-tinta-suave">
        <Headset className="size-4 shrink-0 text-cerceta-profundo" aria-hidden="true" />
        <span>
          ¿Necesitas ayuda?{" "}
          <span className="font-semibold text-cerceta-profundo">Línea gratuita 01 8000 123 456</span>
        </span>
      </p>
    </>
  );
}
