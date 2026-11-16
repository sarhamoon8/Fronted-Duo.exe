"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { validarCredenciales } from "@/core/application/use-cases/auth.use-cases";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Checkbox } from "@/presentation/components/ui/checkbox";
import { Input } from "@/presentation/components/ui/field";
import { Separador } from "@/presentation/components/ui/separador";
import { AccesoGoogle } from "./acceso-google";

/** Solo permitimos redirecciones internas (evita open redirects). */
function destinoSeguro(valor: string | null): string {
  return valor && valor.startsWith("/") && !valor.startsWith("//") ? valor : "/inicio";
}

const ENLACE = "inline-flex items-center justify-center font-medium text-cerceta-profundo underline underline-offset-4";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const establecer = useSesionStore((s) => s.establecer);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const idPassword = useId();
  const destino = destinoSeguro(params.get("siguiente"));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const locales = validarCredenciales({ email, password });
    setErrores(locales);
    if (locales.length) return;

    setEnviando(true);
    try {
      const sesion = await casosDeUso.iniciarSesion.ejecutar({ email, password });
      establecer(sesion);
      router.replace(destino);
      router.refresh();
    } catch (err) {
      setErrores(err instanceof AppError ? err.mensajes : [mensajeDeError(err)]);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5" aria-describedby="login-estado">
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
        placeholder="nombre@correo.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <Input
          id={idPassword}
          etiqueta="Contraseña"
          type={mostrarPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          placeholder="Escribe tu contraseña"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Checkbox checked={mostrarPassword} onChange={(e) => setMostrarPassword(e.target.checked)} aria-controls={idPassword} className="min-h-9 py-1">
          Mostrar contraseña
        </Checkbox>
      </div>
      <div className="flex flex-col gap-3">
        <Button type="submit" variante="autenticacion" cargando={enviando} className="w-full">
          Iniciar sesión
        </Button>
        <div className="lg:hidden">
          <Separador texto="o" />
        </div>
        <div className="hidden lg:block">
          <Separador texto="o continuar con" />
        </div>
        <AccesoGoogle destino={destino} />
        <Link href="/recuperar-contrasena" className={`${ENLACE} min-h-11 text-sm`}>
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <div className="flex flex-col items-center border-t border-borde pt-4 text-center">
        <p className="text-[15px] text-tinta-suave">¿No tienes una cuenta?</p>
        <Link href="/registro" className={`${ENLACE} min-h-10 text-[15px] font-semibold`}>
          Crear cuenta
        </Link>
      </div>
    </form>
  );
}
