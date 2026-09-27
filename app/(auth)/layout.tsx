import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/presentation/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[28rem_1fr]">
      <aside className="hidden flex-col justify-between bg-cerceta-oscuro p-10 text-white lg:flex">
        <Link href="/" className="self-start rounded-lg">
          <Logo />
        </Link>
        <div>
          <p className="text-3xl font-semibold leading-tight">Tu turno, sin hacer fila.</p>
          <ul className="mt-6 flex flex-col gap-3 text-sm text-white/90">
            {["Turnos virtuales con tu posición en la fila", "Seguimiento de tu atención", "Consulta de medicamentos antes de desplazarte"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-menta" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/70">FilaCero no diagnostica ni reemplaza la atención médica.</p>
      </aside>
      <div className="flex flex-col">
        <header className="bg-cerceta-oscuro px-4 py-4 lg:hidden">
          <Link href="/" className="inline-block rounded-lg">
            <Logo />
          </Link>
        </header>
        <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
