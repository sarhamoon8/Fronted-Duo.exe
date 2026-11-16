import type { Metadata } from "next";
import { Card } from "@/presentation/components/ui/card";
import { AyudaContacto } from "@/presentation/components/auth/ayuda-contacto";
import { RestablecerForm } from "@/presentation/components/auth/restablecer-form";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function RestablecerContrasenaPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return (
    <>
      <Card className="mx-auto max-w-[476px]">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-titulo">Ingresa tu nueva contraseña</h1>
        <p className="mb-6 mt-2 text-[15px] text-tinta-suave">Escríbela dos veces. Ambas contraseñas deben coincidir.</p>
        <RestablecerForm token={typeof token === "string" && token ? token : null} />
      </Card>
      <AyudaContacto />
    </>
  );
}
