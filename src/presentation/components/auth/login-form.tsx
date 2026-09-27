"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { validarCredenciales } from "@/core/application/use-cases/auth.use-cases";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/field";

/** Solo permitimos redirecciones internas (evita open redirects). */
function destinoSeguro(valor: string | null): string {
  return valor && valor.startsWith("/") && !valor.startsWith("//") ? valor : "/inicio";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const establecer = useSesionStore((s) => s.establecer);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const locales = validarCredenciales({ email, password });
    setErrores(locales);
    if (locales.length) return;

    setEnviando(true);
    try {
      const sesion = await casosDeUso.iniciarSesion.ejecutar({ email, password });
      establecer(sesion);
      router.replace(destinoSeguro(params.get("siguiente")));
      router.refresh();
    } catch (err) {
      setErrores(err instanceof AppError ? err.mensajes : [mensajeDeError(err)]);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" aria-describedby="login-estado">
      <div id="login-estado" className="flex flex-col gap-3">
        {params.get("expirada") && !errores.length && (
          <Alert tono="info" titulo="Tu sesión expiró">Vuelve a iniciar sesión para continuar.</Alert>
        )}
        <ListaErrores errores={errores} />
      </div>
      <Input
        etiqueta="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        etiqueta="Contraseña"
        type="password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" cargando={enviando} className="mt-2 w-full">
        Iniciar sesión
      </Button>
      <p className="text-center text-sm text-tinta-suave">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-cerceta-profundo underline underline-offset-4">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
