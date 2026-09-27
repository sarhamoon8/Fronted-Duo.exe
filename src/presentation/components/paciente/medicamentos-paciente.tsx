"use client";

import { useState } from "react";
import {
  Ambulance,
  CalendarCheck,
  Check,
  CircleCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  File,
  Hospital,
  Lock,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { FORMULA_ACTIVA, SEDES_FARMACIA, type Disponibilidad } from "@/presentation/mocks/demo";
import { cn } from "@/presentation/lib/cn";
import { Alert } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Card, EncabezadoPagina, Pildora } from "@/presentation/components/ui/card";

const DISPONIBILIDAD: Record<Disponibilidad, { texto: string; tono: "menta" | "ambar" | "rojo"; icono: React.ReactNode }> = {
  DISPONIBLE: { texto: "Disponible", tono: "menta", icono: <CircleCheck className="size-[13px]" aria-hidden="true" /> },
  BAJA: { texto: "Baja disponibilidad", tono: "ambar", icono: <TriangleAlert className="size-[13px]" aria-hidden="true" /> },
  AGOTADO: { texto: "Agotado", tono: "rojo", icono: <TriangleAlert className="size-[13px]" aria-hidden="true" /> },
};

/**
 * Fórmula activa y reserva de medicamentos (Figma: "Medicamentos formulados").
 * DATOS DE EJEMPLO: el backend aún no tiene fórmulas, inventario ni reservas
 * (ver src/presentation/mocks/demo.ts). Reservar y Cambiar sede no tienen acción.
 */
export function MedicamentosPaciente() {
  const f = FORMULA_ACTIVA;
  const [seleccion, setSeleccion] = useState<string[]>(
    f.medicamentos.filter((m) => m.disponibilidad === "DISPONIBLE").map((m) => m.id),
  );
  const [sedeId, setSedeId] = useState(SEDES_FARMACIA[0]!.id);
  const sede = SEDES_FARMACIA.find((s) => s.id === sedeId)!;

  const alternar = (id: string) =>
    setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <EncabezadoPagina
        className="mb-0"
        titulo="Fórmula activa"
        descripcion={`Orden #${f.numero} · Emitida el ${f.emitida}`}
        acciones={
          <Pildora tono="menta" icono={<CalendarCheck className="size-[13px]" aria-hidden="true" />}>
            Vigente hasta {f.vigenteHasta}
          </Pildora>
        }
      />

      <Alert tono="info" titulo="Reserva temporal, no compra" icono={<ShieldCheck className="size-5" />}>
        Al confirmar, la sede separará los medicamentos disponibles durante 24-48 horas. La entrega está sujeta a
        validación de fórmula, afiliación y documento de identidad.
      </Alert>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
          <Card className="flex items-center gap-4 p-[22px] sm:gap-5 sm:p-[22px]">
            <span aria-hidden="true" className="flex size-[54px] shrink-0 items-center justify-center rounded-xl bg-aqua text-cerceta-oscuro">
              <Ambulance className="size-[27px]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] text-titulo">{f.medico}</p>
              <p className="mt-1 text-xs text-tinta-tenue">{f.especialidad}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-cerceta-oscuro">{f.medicamentos.length}</p>
              <p className="text-[11px] text-tinta-tenue">medicamentos formulados</p>
            </div>
          </Card>

          <section aria-labelledby="t-formulados" className="flex flex-col gap-[18px]">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="t-formulados" className="text-xl text-titulo">Medicamentos formulados</h2>
                <p className="mt-1 text-[13px] text-tinta-tenue">Selecciona los que deseas incluir en la reserva.</p>
              </div>
              <Pildora tono="aqua">{seleccion.length} seleccionados</Pildora>
            </div>
            <ul className="flex flex-col gap-3">
              {f.medicamentos.map((m) => {
                const d = DISPONIBILIDAD[m.disponibilidad];
                const marcado = seleccion.includes(m.id);
                return (
                  <li key={m.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer flex-col gap-3.5 rounded-2xl border border-borde p-[18px] shadow-tarjeta transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cerceta-noche",
                        marcado ? "bg-[#fafffe]" : "bg-superficie hover:border-cerceta/40",
                      )}
                    >
                      <span className="flex items-center gap-3.5">
                        <input type="checkbox" checked={marcado} onChange={() => alternar(m.id)} className="peer sr-only" />
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-md border-2",
                            marcado ? "border-esmeralda bg-esmeralda text-white" : "border-borde bg-superficie",
                          )}
                        >
                          {marcado && <Check className="size-3.5" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base text-titulo">{m.nombre}</span>
                          <span className="mt-1 block text-xs text-tinta-tenue">{m.presentacion}</span>
                        </span>
                        <Pildora tono={d.tono} icono={d.icono}>{d.texto}</Pildora>
                      </span>
                      <span className="flex gap-4 border-t border-borde pt-3 text-xs">
                        <span className="flex flex-1 items-center gap-2 text-tinta">
                          <Clock className="size-4 text-cerceta" strokeWidth={1.75} aria-hidden="true" />
                          {m.posologia}
                        </span>
                        <span className="flex items-center gap-2 text-cerceta-oscuro">
                          <Hospital className="size-4" strokeWidth={1.75} aria-hidden="true" />
                          {m.sedesConStock} {m.sedesConStock === 1 ? "sede" : "sedes"}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:w-[380px] lg:shrink-0">
          <Card aria-labelledby="t-reserva" className="flex flex-col gap-[18px] p-[22px] sm:p-[22px]">
            <div>
              <h2 id="t-reserva" className="text-xl text-titulo">Tu reserva</h2>
              <p className="mt-1 text-[13px] text-tinta-tenue">Sede con la fórmula completa.</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-cerceta bg-aqua p-4">
              <div className="flex items-center justify-between gap-2">
                <Hospital className="size-5 text-cerceta-oscuro" strokeWidth={1.75} aria-hidden="true" />
                <Pildora tono={sede.cobertura === sede.total ? "menta" : "ambar"}>
                  {sede.cobertura === sede.total ? "Fórmula completa" : "Fórmula parcial"}
                </Pildora>
              </div>
              <p className="text-sm text-titulo">{sede.nombre}</p>
              <p className="text-xs leading-[1.45] text-tinta-tenue">{sede.direccion}</p>
            </div>
            <dl className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between"><dt className="text-tinta-tenue">Medicamentos</dt><dd className="font-bold text-tinta">{seleccion.length} seleccionados</dd></div>
              <div className="flex justify-between"><dt className="text-tinta-tenue">Tiempo de reserva</dt><dd className="font-bold text-esmeralda-profundo">{sede.horasReserva} horas</dd></div>
              <div className="flex justify-between"><dt className="text-tinta-tenue">Retiro máximo</dt><dd className="font-bold text-tinta">27 sep · 4:30 p. m.</dd></div>
            </dl>
            <Button className="w-full" disabled={!seleccion.length} icono={<Lock className="size-[18px]" aria-hidden="true" />}>
              Reservar medicamentos
            </Button>
            <Button variante="secundario" className="w-full">Cambiar sede</Button>
          </Card>
          <div className="flex gap-3 rounded-xl bg-ambar-fondo p-4">
            <File className="size-5 shrink-0 text-ambar-vivo" strokeWidth={1.75} aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-ambar-vivo">Lleva tus documentos</p>
              <p className="mt-0.5 text-[13px] leading-[1.45] text-tinta">Presenta documento original y fórmula. Si retira un tercero, debe llevar autorización firmada.</p>
            </div>
          </div>
        </aside>
      </div>

      <Card aria-labelledby="t-sedes" className="flex flex-col gap-4 p-[22px] sm:p-[22px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="t-sedes" className="text-xl text-titulo">Disponibilidad por sede</h2>
            <p className="mt-1 text-[13px] text-tinta-tenue">Inventario actualizado hace 7 minutos.</p>
          </div>
          <button type="button" className="flex h-[50px] w-full items-center gap-2.5 rounded-xl border border-borde px-3.5 text-left text-sm text-tinta sm:w-[260px]">
            <Search className="size-[18px] text-tinta-tenue" strokeWidth={1.75} aria-hidden="true" />
            <span className="flex-1">Buscar otra sede</span>
            <ChevronDown className="size-4 text-tinta-tenue" aria-hidden="true" />
          </button>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <caption className="sr-only">Cobertura de la fórmula por sede</caption>
            <thead className="text-[11px] text-tinta-tenue">
              <tr className="bg-neutro">
                <th scope="col" className="h-10 rounded-l-lg px-3.5 font-normal">SEDE</th>
                <th scope="col" className="w-[120px] px-3.5 font-normal">COBERTURA</th>
                <th scope="col" className="w-[100px] px-3.5 font-normal">RESERVA</th>
                <th scope="col" className="w-[110px] px-3.5 font-normal">ESTADO</th>
                <th scope="col" className="w-10 rounded-r-lg px-3.5"><span className="sr-only">Elegir</span></th>
              </tr>
            </thead>
            <tbody>
              {SEDES_FARMACIA.map((s) => {
                const completa = s.cobertura === s.total;
                const activa = s.id === sedeId;
                return (
                  <tr key={s.id} className="border-b border-borde text-[13px] text-tinta">
                    <td className="px-3.5 py-2.5">
                      <label className="flex min-h-[38px] cursor-pointer items-center gap-2.5">
                        <input type="radio" name="sede-farmacia" checked={activa} onChange={() => setSedeId(s.id)} className="size-[18px] accent-cerceta" />
                        <span>
                          <span className="block font-bold">{s.nombre}</span>
                          <span className="block text-[11px] text-tinta-tenue">{s.direccion}</span>
                        </span>
                      </label>
                    </td>
                    <td className="px-3.5 font-bold">{s.cobertura} de {s.total}</td>
                    <td className="px-3.5">{s.horasReserva} h</td>
                    <td className="px-3.5"><Pildora tono={completa ? "menta" : "ambar"}>{completa ? "Completa" : "Parcial"}</Pildora></td>
                    <td className="px-3.5 text-tinta-tenue"><ChevronRight className="size-[18px]" aria-hidden="true" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
