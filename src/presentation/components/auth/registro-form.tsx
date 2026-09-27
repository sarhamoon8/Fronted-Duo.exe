"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { validarRegistro } from "@/core/application/use-cases/auth.use-cases";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { ListaErrores } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/field";

export function RegistroForm() {
  const router = useRouter();
  const establecer = useSesionStore((s) => s.establecer);
  const [datos, setDatos] = useState({ nombre: "", email: "", password: "" });
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  const set = (campo: keyof typeof datos) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatos((d) => ({ ...d, [campo]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const locales = validarRegistro(datos);
    setErrores(locales);
    if (locales.length) return;

    setEnviando(true);
    try {
      const sesion = await casosDeUso.registrarse.ejecutar(datos);
      establecer(sesion);
      router.replace("/inicio");
      router.refresh();
    } catch (err) {
      setErrores(err instanceof AppError ? err.mensajes : [mensajeDeError(err)]);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <ListaErrores errores={errores} />
      <Input etiqueta="Nombre completo" name="nombre" autoComplete="name" required value={datos.nombre} onChange={set("nombre")} />
      <Input etiqueta="Correo electrónico" type="email" name="email" autoComplete="email" inputMode="email" required value={datos.email} onChange={set("email")} />
      <Input
        etiqueta="Contraseña"
        type="password"
        name="password"
        autoComplete="new-password"
        required
        minLength={6}
        ayuda="Mínimo 6 caracteres."
        value={datos.password}
        onChange={set("password")}
      />
      <Button type="submit" cargando={enviando} className="mt-2 w-full">
        Crear cuenta
      </Button>
      <p className="text-center text-sm text-tinta-suave">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-cerceta-profundo underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
