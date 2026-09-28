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
import { Input, Select } from "@/presentation/components/ui/field";

const TIPOS_DOCUMENTO = [
  { valor: "CC", etiqueta: "Cédula de ciudadanía" },
  { valor: "TI", etiqueta: "Tarjeta de identidad" },
  { valor: "CE", etiqueta: "Cédula de extranjería" },
  { valor: "PA", etiqueta: "Pasaporte" },
] as const;

const VACIO = {
  numeroDocumento: "",
  tipoDocumento: "CC",
  nombres: "",
  apellidos: "",
  email: "",
  password: "",
  telefono: "",
};

export function RegistroForm() {
  const router = useRouter();
  const establecer = useSesionStore((s) => s.establecer);
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  const set = (campo: keyof typeof datos) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Select etiqueta="Tipo de documento" name="tipoDocumento" required value={datos.tipoDocumento} onChange={set("tipoDocumento")}>
          {TIPOS_DOCUMENTO.map((t) => (
            <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
          ))}
        </Select>
        <Input
          etiqueta="Número de documento"
          name="numeroDocumento"
          inputMode="numeric"
          autoComplete="off"
          required
          value={datos.numeroDocumento}
          onChange={set("numeroDocumento")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input etiqueta="Nombres" name="nombres" autoComplete="given-name" required value={datos.nombres} onChange={set("nombres")} />
        <Input etiqueta="Apellidos" name="apellidos" autoComplete="family-name" required value={datos.apellidos} onChange={set("apellidos")} />
      </div>
      <Input etiqueta="Correo electrónico" type="email" name="email" autoComplete="email" inputMode="email" required value={datos.email} onChange={set("email")} />
      <Input
        etiqueta="Teléfono (opcional)"
        name="telefono"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        value={datos.telefono}
        onChange={set("telefono")}
      />
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
