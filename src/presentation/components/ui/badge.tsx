import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import type { EstadoTurno } from "@/core/domain/entities/turno";
import { ESTADO_TURNO_ETIQUETA } from "@/core/domain/entities/turno";
import { Pildora } from "./card";

const TURNO: Record<EstadoTurno, { tono: "borde" | "aqua" | "menta" | "neutro"; icono: React.ReactNode }> = {
  PENDIENTE: { tono: "borde", icono: <Clock3 className="size-3.5" aria-hidden="true" /> },
  EN_CURSO: { tono: "aqua", icono: <Loader2 className="size-3.5" aria-hidden="true" /> },
  ATENDIDO: { tono: "menta", icono: <CheckCircle2 className="size-3.5" aria-hidden="true" /> },
  CANCELADO: { tono: "neutro", icono: <XCircle className="size-3.5" aria-hidden="true" /> },
};

export function BadgeEstadoTurno({ estado }: { estado: EstadoTurno }) {
  const e = TURNO[estado];
  return (
    <Pildora tono={e.tono} icono={e.icono}>
      {ESTADO_TURNO_ETIQUETA[estado]}
    </Pildora>
  );
}
