"use client";

import Link from "next/link";
import { CalendarDays, CircleCheck, Clock3, Download, Settings, Target, Ticket, TrendingUp } from "lucide-react";
import { META_ESPERA_MIN, useResumenOperativo } from "@/presentation/hooks/use-resumen-operativo";
import { cn, fechaLarga, formatearHora } from "@/presentation/lib/cn";
import { ESTADO_RED, INVENTARIO_CRITICO } from "@/presentation/mocks/demo";
import { Alert } from "@/presentation/components/ui/alert";
import { Button, claseBoton } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina, Indicador, MarcaDemo, Pildora } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Spinner } from "@/presentation/components/ui/spinner";
import { GraficoDemanda } from "./grafico-demanda";

export function ResumenOperativo() {
  const { datos, error, en } = useResumenOperativo();
  const hayDemanda = datos?.demandaPorHora.some((d) => d.turnos > 0);
  const conEspera = datos?.porServicio.filter((s) => s.esperaMin !== null) ?? [];
  const cumplen = conEspera.filter((s) => (s.esperaMin ?? 0) < META_ESPERA_MIN).length;

  return (
    <>
      <EncabezadoPagina
        titulo="Estado de la operación"
        descripcion={`${fechaLarga()}${en ? ` · corte ${formatearHora(en)}` : ""}`}
        acciones={
          <>
            <Button variante="secundario" icono={<CalendarDays className="size-4" aria-hidden="true" />}>Hoy</Button>
            <Button variante="estructura" icono={<Download className="size-4" aria-hidden="true" />}>Exportar reporte</Button>
          </>
        }
      />

      {error && <Alert tono="error" titulo="No se pudieron cargar los indicadores" className="mb-6">{error}</Alert>}

      {!datos ? (
        !error && <Spinner etiqueta="Calculando indicadores…" />
      ) : (
        <>
          <section aria-label="Indicadores" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador etiqueta="Turnos emitidos" icono={<Ticket className="size-4" />} valor={datos.emitidosHoy} detalle="Hoy, en todas las sedes" />
            <Indicador
              etiqueta="Turnos atendidos"
              icono={<CircleCheck className="size-4" />}
              tono="menta"
              valor={datos.atendidosHoy}
              detalle={datos.nivelServicio !== null ? `${datos.nivelServicio.toLocaleString("es-CO")}% del total emitido` : "Sin turnos hoy"}
            />
            <Indicador etiqueta="Espera promedio" icono={<Clock3 className="size-4" />} tono="azul" valor={datos.esperaPromedio !== null ? `${datos.esperaPromedio} min` : "—"} detalle="Turnos en espera ahora" />
            <Indicador
              etiqueta="Nivel de servicio"
              icono={<TrendingUp className="size-4" />}
              valor={datos.nivelServicio !== null ? `${datos.nivelServicio.toLocaleString("es-CO")}%` : "—"}
              detalle="Meta mensual: 90%"
            />
          </section>

          <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
            <Card aria-labelledby="t-demanda">
              <CardTitulo
                id="t-demanda"
                descripcion="Turnos emitidos hoy en todas las sedes."
                acciones={<Pildora tono="menta" icono={<span className="size-2 rounded-full bg-esmeralda" aria-hidden="true" />}>En vivo</Pildora>}
              >
                Demanda por hora
              </CardTitulo>
              {hayDemanda ? <GraficoDemanda datos={datos.demandaPorHora} /> : <EstadoVacio titulo="Aún no se han emitido turnos hoy" />}
            </Card>

            <Card aria-labelledby="t-espera">
              <CardTitulo id="t-espera" descripcion="Promedio de los turnos en espera ahora.">Espera por servicio</CardTitulo>
              {conEspera.length === 0 ? (
                <p className="text-sm text-tinta-tenue">No hay turnos en espera.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {conEspera.slice(0, 5).map((s) => {
                    const alta = (s.esperaMin ?? 0) >= 25;
                    return (
                      <li key={s.nombre}>
                        <div className="mb-1.5 flex justify-between gap-2 text-sm">
                          <span className="truncate">{s.nombre}</span>
                          <span className={cn("font-semibold", alta ? "text-ambar-vivo" : "text-esmeralda-profundo")}>{s.esperaMin} min</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-neutro" aria-hidden="true">
                          <div className={cn("h-full rounded-full", alta ? "bg-ambar-vivo" : "bg-cerceta-profundo")} style={{ width: `${Math.min(100, ((s.esperaMin ?? 0) / (META_ESPERA_MIN * 1.2)) * 100)}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-5 flex items-center gap-2 rounded-lg bg-menta px-3 py-2.5 text-sm text-cerceta-noche">
                <Target className="size-4 shrink-0" aria-hidden="true" />
                {conEspera.length ? `${cumplen} de ${conEspera.length} servicios cumplen la meta de espera.` : `Meta: menos de ${META_ESPERA_MIN} minutos.`}
              </p>
            </Card>
          </div>

          <Card aria-labelledby="t-servicios" className="mb-6">
            <CardTitulo
              id="t-servicios"
              descripcion="Disponibilidad de personal y carga de las colas."
              acciones={
                <Link href="/admin/servicios" className={claseBoton("secundario")}>
                  <Settings className="size-4" aria-hidden="true" /> Gestionar servicios
                </Link>
              }
            >
              Servicios activos
            </CardTitulo>
            {datos.porServicio.length === 0 ? (
              <EstadoVacio titulo="No hay servicios registrados">Créalos desde “Gestionar servicios”.</EstadoVacio>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <caption className="sr-only">Servicios activos y carga de sus colas</caption>
                  <thead className="bg-neutro text-[11px] uppercase tracking-wider text-tinta-tenue">
                    <tr>
                      <th scope="col" className="rounded-l-lg px-4 py-2.5 font-semibold">Servicio</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Sedes</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">En fila</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Espera</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Personal</th>
                      <th scope="col" className="rounded-r-lg px-4 py-2.5 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borde">
                    {datos.porServicio.map((s) => {
                      const alta = s.enFila >= 10 || (s.esperaMin ?? 0) >= 25;
                      return (
                        <tr key={s.nombre}>
                          <td className="px-4 py-3.5">{s.nombre}</td>
                          <td className="px-4 py-3.5 text-tinta-tenue">{s.sedes} {s.sedes === 1 ? "sede" : "sedes"}</td>
                          <td className="px-4 py-3.5 font-semibold">{s.enFila}</td>
                          <td className={cn("px-4 py-3.5 font-semibold", (s.esperaMin ?? 0) >= 25 && "text-ambar-vivo")}>{s.esperaMin !== null ? `${s.esperaMin} min` : "—"}</td>
                          <td className="px-4 py-3.5 text-tinta-tenue">—</td>
                          <td className="px-4 py-3.5"><Pildora tono={alta ? "ambar" : "menta"}>{alta ? "Alta demanda" : "Operando"}</Pildora></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <Card aria-labelledby="t-inv">
              <CardTitulo
                id="t-inv"
                descripcion="Medicamentos con cobertura menor a 20 días."
                acciones={
                  <div className="flex items-center gap-2">
                    <MarcaDemo />
                    <Link href="/admin/inventario" className={claseBoton("secundario")}>Ver inventario</Link>
                  </div>
                }
              >
                Inventario crítico
              </CardTitulo>
              <ListaInventario />
            </Card>

            <Card aria-labelledby="t-red">
              <CardTitulo id="t-red" descripcion={`${datos.entidades.length} sedes monitoreadas.`} acciones={<MarcaDemo />}>
                Estado de la red
              </CardTitulo>
              <dl className="flex flex-col gap-3 text-sm">
                <FilaRed titulo="Sedes operativas" valor={`${datos.entidades.length} / ${datos.entidades.length}`} tono="menta" />
                <FilaRed titulo="Ventanillas activas" valor={ESTADO_RED.ventanillas} tono="menta" />
                <FilaRed titulo="Alertas abiertas" valor={String(ESTADO_RED.alertas)} tono="ambar" />
                <FilaRed titulo="Incidentes críticos" valor={String(ESTADO_RED.incidentes)} tono="menta" />
              </dl>
            </Card>
          </div>
        </>
      )}
    </>
  );
}

const ESTADO_INV = {
  DISPONIBLE: { texto: "Disponible", tono: "menta" as const },
  STOCK_BAJO: { texto: "Stock bajo", tono: "ambar" as const },
  AGOTADO: { texto: "Agotado", tono: "rojo" as const },
};

export function ListaInventario() {
  return (
    <ul className="divide-y divide-borde">
      {INVENTARIO_CRITICO.map((m) => (
        <li key={m.nombre} className="flex items-center gap-4 py-3">
          <div className="flex-1">
            <p className="text-sm font-medium">{m.nombre}</p>
            <p className="text-xs text-tinta-tenue">{m.cobertura}</p>
          </div>
          <span className="w-20 text-right text-sm text-tinta-suave">{m.unidades.toLocaleString("es-CO")} und.</span>
          <span className="w-24 text-right"><Pildora tono={ESTADO_INV[m.estado].tono}>{ESTADO_INV[m.estado].texto}</Pildora></span>
        </li>
      ))}
    </ul>
  );
}

function FilaRed({ titulo, valor, tono }: { titulo: string; valor: string; tono: "menta" | "ambar" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-tinta-suave">{titulo}</dt>
      <dd><Pildora tono={tono}>{valor}</Pildora></dd>
    </div>
  );
}
