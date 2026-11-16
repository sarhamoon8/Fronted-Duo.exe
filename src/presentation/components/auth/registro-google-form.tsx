"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { validarAccesoGoogle } from "@/core/application/use-cases/auth.use-cases";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { borrarPendienteGoogle, type PendienteGoogle } from "@/presentation/lib/registro-google";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Checkbox } from "@/presentation/components/ui/checkbox";
import { Input, Select } from "@/presentation/components/ui/field";
import { TIPOS_DOCUMENTO } from "./tipos-documento";

const ENLACE = "font-semibold text-cerceta-profundo underline underline-offset-2";

/** Segundo paso del registro con Google: faltan el documento y aceptar los términos. */
export function RegistroGoogleForm({ pendiente }: { pendiente: PendienteGoogle }) {
  const router = useRouter();
  const establecer = useSesionStore((s) => s.establecer);
  const [datos, setDatos] = useState({
    tipoDocumento: "CC",
    numeroDocumento: "",
    nombres: pendiente.perfil.nombres,
    apellidos: pendiente.perfil.apellidos,
    telefono: "",
    aceptaTerminos: false,
  });
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  const set = (campo: keyof typeof datos) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDatos((d) => ({ ...d, [campo]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const locales = validarAccesoGoogle({ credential: pendiente.credential, ...datos });
    setErrores(locales);
    if (locales.length) return;

    setEnviando(true);
    try {
      const resultado = await casosDeUso.accederConGoogle.ejecutar({ credential: pendiente.credential, ...datos });
      if (resultado.tipo !== "sesion") throw new AppError(["No se pudo completar el registro. Intenta de nuevo."], 400);
      borrarPendienteGoogle();
      establecer(resultado.sesion);
      router.replace("/inicio");
      router.refresh();
    } catch (err) {
      setErrores(err instanceof AppError ? err.mensajes : [mensajeDeError(err)]);
      // La autorización de Google dura cerca de una hora: si venció, hay que empezar de nuevo.
      if (err instanceof AppError && err.status === 401) borrarPendienteGoogle();
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Alert tono="info" titulo="Continúas con Google">
        Tu cuenta será <strong>{pendiente.perfil.email}</strong>. Completa estos datos para crearla.
      </Alert>
      <ListaErrores errores={errores} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select etiqueta="Tipo de documento" name="tipoDocumento" required value={datos.tipoDocumento} onChange={set("tipoDocumento")}>
          {TIPOS_DOCUMENTO.map((t) => (
            <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
          ))}
        </Select>
        <Input etiqueta="Número de documento" name="numeroDocumento" inputMode="numeric" autoComplete="off" placeholder="00000000" required value={datos.numeroDocumento} onChange={set("numeroDocumento")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input etiqueta="Nombres" name="nombres" autoComplete="given-name" required value={datos.nombres} onChange={set("nombres")} />
        <Input etiqueta="Apellidos" name="apellidos" autoComplete="family-name" required value={datos.apellidos} onChange={set("apellidos")} />
      </div>
      <Input etiqueta="Teléfono (opcional)" name="telefono" type="tel" autoComplete="tel" inputMode="tel" placeholder="+57 300 000 0000" value={datos.telefono} onChange={set("telefono")} />
      <Checkbox name="aceptaTerminos" checked={datos.aceptaTerminos} onChange={(e) => setDatos((d) => ({ ...d, aceptaTerminos: e.target.checked }))}>
        Acepto los{" "}
        <Link href="/terminos" target="_blank" rel="noopener noreferrer" className={ENLACE}>Términos de uso</Link>{" "}
        y autorizo el tratamiento de mis datos según la{" "}
        <Link href="/privacidad" target="_blank" rel="noopener noreferrer" className={ENLACE}>Política de privacidad</Link>.
      </Checkbox>
      <Button type="submit" variante="autenticacion" cargando={enviando} className="w-full">Crear cuenta</Button>
      <button type="button" onClick={borrarPendienteGoogle} className="min-h-9 text-center text-sm font-semibold text-cerceta-profundo">
        Usar otro método
      </button>
    </form>
  );
}
