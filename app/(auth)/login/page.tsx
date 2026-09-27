import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/presentation/components/ui/card";
import { LoginForm } from "@/presentation/components/auth/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <Card>
      <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
      <p className="mb-6 mt-1 text-tinta-suave">Accede para gestionar tus turnos.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </Card>
  );
}
