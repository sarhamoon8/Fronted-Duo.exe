import type { Metadata } from "next";
import { Card } from "@/presentation/components/ui/card";
import { AyudaContacto } from "@/presentation/components/auth/ayuda-contacto";
import { RecuperarForm } from "@/presentation/components/auth/recuperar-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecuperarContrasenaPage() {
  return (
    <>
      <Card className="mx-auto max-w-[476px]">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-titulo">Recuperar contraseña</h1>
        <p className="mb-6 mt-2 text-[15px] text-tinta-suave">Escribe el correo que usaste al crear tu cuenta.</p>
        <RecuperarForm />
      </Card>
      <AyudaContacto />
    </>
  );
}
