"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { guardarPendienteGoogle, type PendienteGoogle } from "@/presentation/lib/registro-google";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { BotonGoogle } from "./boton-google";

/**
 * "Continuar con Google" para iniciar sesión y para crear cuenta (mismo flujo):
 * si el correo ya tiene cuenta entra directo; si no, lleva a completar el
 * registro (documento y términos) con los datos de Google ya precargados.
 */
export function AccesoGoogle({
  destino = "/inicio",
  onIncompleto,
}: {
  destino?: string;
  /** Si no se pasa, se guarda el pendiente y se navega a /registro. */
  onIncompleto?: (pendiente: PendienteGoogle) => void;
}) {
  const router = useRouter();
  const establecer = useSesionStore((s) => s.establecer);
  const [errores, setErrores] = useState<string[]>([]);
  const [noDisponible, setNoDisponible] = useState(false);
  const [procesando, setProcesando] = useState(false);

  async function alRecibir(credential: string) {
    setErrores([]);
    setProcesando(true);
    try {
      const resultado = await casosDeUso.accederConGoogle.ejecutar({ credential });
      if (resultado.tipo === "sesion") {
        establecer(resultado.sesion);
        router.replace(destino);
        router.refresh();
        return;
      }
      const pendiente = { credential, perfil: resultado.perfil };
      if (onIncompleto) onIncompleto(pendiente);
      else {
        guardarPendienteGoogle(pendiente);
        router.push("/registro");
      }
    } catch (err) {
      setErrores(err instanceof AppError ? err.mensajes : [mensajeDeError(err)]);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <BotonGoogle onCredential={alRecibir} onNoDisponible={() => setNoDisponible(true)} />
      {procesando && (
        <p role="status" className="text-center text-[13px] text-tinta-suave">
          Conectando con tu cuenta de Google…
        </p>
      )}
      {noDisponible && (
        <Alert tono="info" titulo="Acceso con Google no disponible">
          Todavía no está activado en este entorno. Usa tu correo y contraseña por ahora.
        </Alert>
      )}
      <ListaErrores errores={errores} />
    </div>
  );
}
