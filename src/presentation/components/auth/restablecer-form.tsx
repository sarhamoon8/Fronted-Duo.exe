"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { validarNuevaPassword } from "@/core/application/use-cases/auth.use-cases";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { Button, BotonEnlace } from "@/presentation/components/ui/button";
import { Checkbox } from "@/presentation/components/ui/checkbox";
import { Input } from "@/presentation/components/ui/field";
import { RequisitosPassword } from "./requisitos-password";

const ENLACE = "inline-flex min-h-11 items-center justify-center gap-2 text-[15px] font-medium text-cerceta-profundo underline underline-offset-4";

/** Define la contraseña nueva con el token del enlace del correo. */
export function RestablecerForm({ token }: { token: string | null }) {
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [enlaceVencido, setEnlaceVencido] = useState(false);
  const idRequisitos = `${useId()}-requisitos`;
  const idCampos = `${useId()}-campos`;

  if (!token || enlaceVencido) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tono="error" titulo="El enlace no es válido o ya venció">
          Los enlaces para cambiar la contraseña valen 1 hora y solo se pueden usar una vez. Solicita uno nuevo.
        </Alert>
        <BotonEnlace href="/recuperar-contrasena" variante="primario" className="w-full">
          Solicitar un enlace nuevo
        </BotonEnlace>
        <Link href="/login" className={ENLACE}>
          <ArrowLeft className="size-[18px]" aria-hidden="true" /> Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  if (listo) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tono="exito" titulo="Tu contraseña se actualizó">
          Ya puedes iniciar sesión con tu contraseña nueva.
        </Alert>
        <BotonEnlace href="/login" variante="autenticacion" className="w-full">
          Iniciar sesión
        </BotonEnlace>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const locales = validarNuevaPassword({ password, confirmacion });
    setErrores(locales);
    if (locales.length) return;

    setEnviando(true);
    try {
      await casosDeUso.restablecerPassword.ejecutar({ token: token as string, password, confirmacion });
      setListo(true);
    } catch (err) {
      // El backend responde 400 con este texto cuando el enlace no sirve (vencido, usado o inexistente).
      if (err instanceof AppError && err.status === 400 && /enlace/i.test(err.message)) {
        setEnlaceVencido(true);
        return;
      }
      setErrores(err instanceof AppError ? err.mensajes : [mensajeDeError(err)]);
    } finally {
      setEnviando(false);
    }
  }

  const tipo = mostrar ? "text" : "password";
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <ListaErrores errores={errores} />
      <div id={idCampos} className="flex flex-col gap-5">
        <Input
          etiqueta="Nueva contraseña"
          type={tipo}
          name="password"
          autoComplete="new-password"
          placeholder="Escribe tu contraseña"
          required
          aria-describedby={idRequisitos}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          etiqueta="Confirmar nueva contraseña"
          type={tipo}
          name="confirmacion"
          autoComplete="new-password"
          placeholder="Repítela aquí"
          required
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
        />
      </div>
      <Checkbox checked={mostrar} onChange={(e) => setMostrar(e.target.checked)} aria-controls={idCampos} className="-mt-2">
        Mostrar contraseñas
      </Checkbox>
      <RequisitosPassword id={idRequisitos} password={password} />
      <div className="flex flex-col gap-3">
        <Button type="submit" variante="autenticacion" cargando={enviando} className="w-full">
          Guardar nueva contraseña
        </Button>
        <Link href="/login" className={ENLACE}>
          <ArrowLeft className="size-[18px]" aria-hidden="true" /> Volver a iniciar sesión
        </Link>
      </div>
    </form>
  );
}
