"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { validarRegistro } from "@/core/application/use-cases/auth.use-cases";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Checkbox } from "@/presentation/components/ui/checkbox";
import { Input, Select } from "@/presentation/components/ui/field";
import { BotonGoogle } from "./boton-google";
import { RequisitosPassword } from "./requisitos-password";

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
  aceptaTerminos: false,
};

const ENLACE = "font-semibold text-cerceta-profundo underline underline-offset-2";

export function RegistroForm() {
  const router = useRouter();
  const establecer = useSesionStore((s) => s.establecer);
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [avisoGoogle, setAvisoGoogle] = useState(false);
  const idPassword = useId();
  const idRequisitos = `${idPassword}-requisitos`;

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
          placeholder="00000000"
          required
          value={datos.numeroDocumento}
          onChange={set("numeroDocumento")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input etiqueta="Nombres" name="nombres" autoComplete="given-name" placeholder="Tu nombre" required value={datos.nombres} onChange={set("nombres")} />
        <Input etiqueta="Apellidos" name="apellidos" autoComplete="family-name" placeholder="Tus apellidos" required value={datos.apellidos} onChange={set("apellidos")} />
      </div>
      <Input
        etiqueta="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder="nombre@correo.com"
        required
        value={datos.email}
        onChange={set("email")}
      />
      <Input
        etiqueta="Teléfono (opcional)"
        name="telefono"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="+57 300 000 0000"
        value={datos.telefono}
        onChange={set("telefono")}
      />
      <Input
        id={idPassword}
        etiqueta="Contraseña"
        type={mostrarPassword ? "text" : "password"}
        name="password"
        autoComplete="new-password"
        placeholder="Crea una contraseña"
        required
        aria-describedby={idRequisitos}
        value={datos.password}
        onChange={set("password")}
      />
      <RequisitosPassword id={idRequisitos} password={datos.password} />
      <Checkbox
        checked={mostrarPassword}
        onChange={(e) => setMostrarPassword(e.target.checked)}
        aria-controls={idPassword}
        className="-mt-2 min-h-9 py-1"
      >
        Mostrar contraseña
      </Checkbox>

      <div className="flex items-center gap-3 text-xs text-tinta-tenue" role="separator" aria-label="o">
        <span className="h-px flex-1 bg-borde" />o<span className="h-px flex-1 bg-borde" />
      </div>
      <BotonGoogle onClick={() => setAvisoGoogle(true)} />
      {avisoGoogle && (
        <Alert tono="info" titulo="Registro con Google">
          Esta opción estará disponible pronto. Por ahora crea tu cuenta con tu correo electrónico.
        </Alert>
      )}

      <Checkbox
        name="aceptaTerminos"
        checked={datos.aceptaTerminos}
        onChange={(e) => setDatos((d) => ({ ...d, aceptaTerminos: e.target.checked }))}
      >
        Acepto los{" "}
        <Link href="/terminos" target="_blank" rel="noopener noreferrer" className={ENLACE}>
          Términos de uso
        </Link>{" "}
        y autorizo el tratamiento de mis datos según la{" "}
        <Link href="/privacidad" target="_blank" rel="noopener noreferrer" className={ENLACE}>
          Política de privacidad
        </Link>
        .
      </Checkbox>

      <Button type="submit" cargando={enviando} className="w-full">
        Crear cuenta
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="inline-flex min-h-9 items-center gap-1.5 font-semibold text-cerceta-profundo">
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
