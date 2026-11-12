import { describe, expect, it } from "vitest";
import { calcularResumen } from "./use-resumen-operativo";
import type { EntidadMedica, Servicio } from "@/core/domain/entities/catalogo";
import type { Turno } from "@/core/domain/entities/turno";

const entidades: EntidadMedica[] = [{ id: "e1", nombre: "Hospital Central" }];
const servicios: Servicio[] = [
  { id: "s1", nombre: "Consulta general", entidadId: "e1" },
  { id: "s2", nombre: "Odontología", entidadId: "e1" },
];

function turno(parcial: Partial<Turno>): Turno {
  return {
    id: "t",
    usuarioId: "u",
    servicioId: "s1",
    puntoId: "p1",
    ventanillaId: null,
    codigoAlfanumerico: "A01",
    estado: "PENDIENTE",
    prioridad: false,
    posicion: 1,
    horaLlamado: null,
    horaFinalizacion: null,
    creadoEn: new Date("2026-01-15T14:00:00Z"),
    ...parcial,
  };
}

/** `esHoy()` compara contra la fecha real del sistema, así que las fechas "de hoy" deben ser hoy de verdad. */
function bogotaHoy(horaBogota: number, diasAtras = 0): Date {
  const base = new Date();
  base.setUTCHours(0, 0, 0, 0);
  base.setUTCDate(base.getUTCDate() - diasAtras);
  return new Date(base.getTime() + (horaBogota + 5) * 60 * 60 * 1000);
}

describe("calcularResumen", () => {
  const ahora = bogotaHoy(10).getTime();

  it("calcula emitidos, atendidos y nivel de servicio solo con turnos de hoy", () => {
    const turnoHoyPendiente = turno({ estado: "PENDIENTE", creadoEn: bogotaHoy(9) });
    const turnoHoyAtendido = turno({ estado: "ATENDIDO", servicioId: "s2", creadoEn: bogotaHoy(11) });
    const turnoAyer = turno({ estado: "PENDIENTE", creadoEn: bogotaHoy(9, 1) });

    const resumen = calcularResumen(
      entidades,
      servicios,
      [
        [turnoHoyPendiente, turnoAyer],
        [turnoHoyAtendido],
      ],
      ahora,
    );

    expect(resumen.emitidosHoy).toBe(2);
    expect(resumen.atendidosHoy).toBe(1);
    expect(resumen.nivelServicio).toBe(50);
    expect(resumen.entidades).toBe(entidades);
  });

  it("agrupa por nombre de servicio y ordena por cantidad en fila descendente", () => {
    const pendienteS1 = turno({ estado: "PENDIENTE", servicioId: "s1", creadoEn: new Date("2026-01-15T14:00:00Z") });
    const pendienteS1b = turno({ estado: "PENDIENTE", servicioId: "s1", creadoEn: new Date("2026-01-14T14:00:00Z") });
    const atendidoS2 = turno({ estado: "ATENDIDO", servicioId: "s2", creadoEn: new Date("2026-01-15T14:00:00Z") });

    const resumen = calcularResumen(entidades, servicios, [[pendienteS1, pendienteS1b], [atendidoS2]], ahora);

    expect(resumen.porServicio[0]).toMatchObject({ nombre: "Consulta general", sedes: 1, enFila: 2 });
    expect(resumen.porServicio[1]).toMatchObject({ nombre: "Odontología", sedes: 1, enFila: 0, esperaMin: null });
    expect(resumen.porServicio[0].esperaMin).toBeGreaterThan(0);
  });

  it("devuelve espera y demanda nulas/cero cuando no hay turnos", () => {
    const resumen = calcularResumen(entidades, servicios, [[], []], ahora);

    expect(resumen.esperaPromedio).toBeNull();
    expect(resumen.nivelServicio).toBeNull();
    expect(resumen.emitidosHoy).toBe(0);
    expect(resumen.demandaPorHora.every((d) => d.turnos === 0)).toBe(true);
  });
});
