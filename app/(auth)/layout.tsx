import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/presentation/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[28rem_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-cerceta-oscuro p-10 text-white lg:flex">
        <span aria-hidden="true" className="absolute -left-24 -top-24 size-[380px] rounded-full bg-cerceta/40 blur-3xl" />
        <span aria-hidden="true" className="absolute -bottom-32 -right-20 size-[320px] rounded-full bg-esmeralda/20 blur-3xl" />

        <Link href="/" className="relative self-start rounded-lg">
          <Logo />
        </Link>
        <div className="relative animar-entrada">
          <p className="text-3xl font-semibold leading-tight">Tu turno, sin hacer fila.</p>
          <ul className="mt-6 flex flex-col gap-3.5 text-sm text-white/90">
            {["Turnos virtuales con tu posición en la fila", "Seguimiento de tu atención", "Consulta de medicamentos antes de desplazarte"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <CheckCircle2 className="size-4 text-menta" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/70">FilaCero no diagnostica ni reemplaza la atención médica.</p>
      </aside>
      <div className="flex flex-col">
        <header className="bg-cerceta-oscuro px-4 py-4 lg:hidden">
          <Link href="/" className="inline-block rounded-lg">
            <Logo />
          </Link>
        </header>
        <main className="relative flex flex-1 items-start justify-center overflow-hidden px-4 py-10 sm:items-center">
          <span aria-hidden="true" className="absolute left-1/2 top-0 size-[420px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-aqua/50 blur-3xl sm:top-1/2 sm:-translate-y-1/2" />
          <div className="animar-entrada relative w-full max-w-[522px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
