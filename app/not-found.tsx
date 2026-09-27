import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-semibold text-tinta-suave">Error 404</p>
      <h1 className="text-3xl font-bold">Esta página no existe</h1>
      <Link href="/" className="flex min-h-11 items-center rounded-lg bg-esmeralda px-5 font-semibold text-tinta">
        Volver al inicio
      </Link>
    </main>
  );
}
