import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./logo";

/** Marco común de las páginas legales públicas (términos y privacidad). */
export function PaginaLegal({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-cerceta-oscuro">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4 sm:px-6">
          <Link href="/" className="rounded-lg">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link href="/registro" className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-cerceta-profundo">
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver a crear cuenta
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{titulo}</h1>
        <p className="mt-1 text-sm text-tinta-tenue">Versión preliminar del proyecto académico FilaCero.</p>
        <div className="mt-6 flex flex-col gap-5 text-tinta-suave [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-tinta">{children}</div>
      </main>
    </div>
  );
}
