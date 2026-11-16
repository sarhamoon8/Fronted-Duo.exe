"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, type FormEvent } from "react";
import { validarSolicitudRecuperacion } from "@/core/application/use-cases/auth.use-cases";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/field";

const VOLVER = "inline-flex min-h-11 items-center justify-center gap-2 text-[15px] font-medium text-cerceta-profundo underline underline-offset-4";

/** Pide el enlace para cambiar la contraseña. La respuesta es la misma exista o no la cuenta. */
export function RecuperarForm() {
  const [email, setEmail] = useState("");
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const locales = validarSolicitudRecuperacion(email);
    setErrores(locales);
    if (locales.length) return;

    setEnviando(true);
    try {
      await casosDeUso.solicitarRecuperacion.ejecutar(email);
      setEnviado(true);
    } catch (err) {
      setErrores(err instanceof AppError ? err.mensajes : [mensajeDeError(err)]);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tono="exito" titulo="Revisa tu correo">
          Si hay una cuenta asociada a <strong>{email.trim()}</strong>, recibirás instrucciones para cambiar tu contraseña. El
          enlace vale 1 hora y solo se puede usar una vez.
        </Alert>
        <p className="text-sm text-tinta-suave">¿No te llegó? Revisa la carpeta de spam o vuelve a pedirlo en unos minutos.</p>
        <Link href="/login" className={VOLVER}>
          <ArrowLeft className="size-[18px]" aria-hidden="true" /> Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <ListaErrores errores={errores} />
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
      <p className="text-sm leading-normal text-tinta-suave">
        Si hay una cuenta asociada a este correo, recibirás instrucciones para cambiar tu contraseña.
      </p>
      <div className="flex flex-col gap-3">
        <Button type="submit" variante="autenticacion" cargando={enviando} className="w-full">
          Enviar instrucciones
        </Button>
        <Link href="/login" className={VOLVER}>
          <ArrowLeft className="size-[18px]" aria-hidden="true" /> Volver a iniciar sesión
        </Link>
      </div>
    </form>
  );
}
