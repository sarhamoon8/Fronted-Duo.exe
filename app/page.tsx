import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, ListOrdered, Pill } from "lucide-react";
import { leerToken } from "@/server/session";
import { decodificarJwt, tokenExpirado } from "@/server/jwt";
import { INICIO_POR_ROL } from "@/presentation/components/layout/navegacion";
import { Logo } from "@/presentation/components/layout/logo";
import { claseBoton } from "@/presentation/components/ui/button";

export default async function Home() {
  const token = await leerToken();
  const payload = token ? decodificarJwt(token) : null;
  if (payload && !tokenExpirado(payload)) redirect(INICIO_POR_ROL[payload.rol]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-cerceta-oscuro">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <Link href="/login" className="flex min-h-11 items-center rounded-lg border border-white/60 px-4 text-sm font-semibold text-white hover:bg-white/10">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cerceta-profundo">EPS y centros médicos</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight text-tinta sm:text-5xl">Tu salud, sin filas innecesarias.</h1>
          <p className="mt-4 max-w-xl text-lg text-tinta-suave">
            Solicita un turno virtual, sigue tu posición en la fila y consulta tus medicamentos antes de desplazarte.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/registro" className={claseBoton("primario", "lg")}>Crear cuenta</Link>
            <Link href="/login" className={claseBoton("secundario", "lg")}>Ya tengo cuenta</Link>
          </div>
        </div>

        <ul className="grid gap-4">
          {[
            { icono: ListOrdered, t: "Turnos virtuales", d: "Elige sede y servicio y recibe tu código con tu posición en la fila." },
            { icono: Clock3, t: "Seguimiento de tu atención", d: "Sabe cuántas personas tienes antes y cuándo acercarte a la sede." },
            { icono: Pill, t: "Farmacia informada", d: "Consulta tus medicamentos y su disponibilidad por sede." },
          ].map(({ icono: Icono, t, d }) => (
            <li key={t} className="flex gap-4 rounded-2xl border border-borde bg-superficie p-5">
              <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-menta text-esmeralda-profundo">
                <Icono className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-tinta">{t}</h2>
                <p className="mt-1 text-sm text-tinta-tenue">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
