import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/presentation/lib/cn";

type Tono = "info" | "exito" | "aviso" | "error";

const TONOS: Record<Tono, { caja: string; icono: string; titulo: string }> = {
  info: { caja: "bg-aqua border-transparent", icono: "text-cerceta-oscuro", titulo: "text-cerceta-oscuro" },
  exito: { caja: "bg-menta border-transparent", icono: "text-esmeralda-profundo", titulo: "text-cerceta-oscuro" },
  aviso: { caja: "bg-ambar-fondo border-transparent", icono: "text-ambar-vivo", titulo: "text-ambar-vivo" },
  error: { caja: "bg-rojo-fondo border-transparent", icono: "text-peligro", titulo: "text-peligro" },
};

const ICONOS: Record<Tono, ReactNode> = {
  info: <Info className="size-5" />,
  exito: <CheckCircle2 className="size-5" />,
  aviso: <AlertTriangle className="size-5" />,
  error: <XCircle className="size-5" />,
};

export function Alert({
  tono = "info",
  titulo,
  children,
  className,
  icono,
}: {
  tono?: Tono;
  titulo?: string;
  children?: ReactNode;
  className?: string;
  icono?: ReactNode;
}) {
  const t = TONOS[tono];
  return (
    <div role={tono === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border p-4", t.caja, className)}>
      <span aria-hidden="true" className={cn("mt-0.5 shrink-0", t.icono)}>
        {icono ?? ICONOS[tono]}
      </span>
      <div className="min-w-0 flex-1">
        {titulo && <p className={cn("text-sm font-bold", t.titulo)}>{titulo}</p>}
        {children && <div className="mt-0.5 text-[13px] leading-[1.45] text-tinta">{children}</div>}
      </div>
    </div>
  );
}

export function ListaErrores({ errores }: { errores: string[] }) {
  if (!errores.length) return null;
  return (
    <Alert tono="error" titulo={errores.length === 1 ? errores[0] : "Revisa lo siguiente:"}>
      {errores.length > 1 && (
        <ul className="mt-1 list-disc pl-5">
          {errores.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </Alert>
  );
}
