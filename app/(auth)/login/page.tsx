import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/presentation/components/ui/card";
import { AyudaContacto } from "@/presentation/components/auth/ayuda-contacto";
import { LoginForm } from "@/presentation/components/auth/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <>
      <Card>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-titulo lg:text-[32px]">Iniciar sesión</h1>
        <p className="mb-6 mt-2 text-tinta-suave lg:text-base">
          <span className="lg:hidden">Entra para gestionar tu atención.</span>
          <span className="hidden lg:inline">Accede para gestionar tus turnos.</span>
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </Card>
      <AyudaContacto />
    </>
  );
}
