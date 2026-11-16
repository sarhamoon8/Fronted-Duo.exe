import type { Metadata } from "next";
import { Card } from "@/presentation/components/ui/card";
import { AyudaContacto } from "@/presentation/components/auth/ayuda-contacto";
import { RegistroForm } from "@/presentation/components/auth/registro-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <>
      <Card className="mx-auto max-w-[476px]">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="mb-6 mt-1 text-tinta-suave">
          Las cuentas nuevas se crean como paciente. El personal de atención lo registra un administrador.
        </p>
        <RegistroForm />
      </Card>
      <AyudaContacto />
    </>
  );
}
