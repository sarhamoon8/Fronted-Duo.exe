import { describe, expect, it } from "vitest";
import { calcularResumen } from "./use-resumen-operativo";
import type { EntidadMedica, Servicio, Ventanilla } from "@/core/domain/entities/catalogo";
import type { Turno } from "@/core/domain/entities/turno";
import type { ExistenciaMedicamento, Medicamento } from "@/core/domain/entities/medicamento";

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

  it("cuenta ventanillas activas sobre el total", () => {
    const ventanillas: Ventanilla[] = [
      { id: "v1", puntoId: "p1", numeroModulo: "M1", estadoOperativo: "ACTIVA" },
      { id: "v2", puntoId: "p1", numeroModulo: "M2", estadoOperativo: "INACTIVA" },
      { id: "v3", puntoId: "p2", numeroModulo: "M1", estadoOperativo: "ACTIVA" },
    ];

    const resumen = calcularResumen(entidades, servicios, [[], []], ahora, ventanillas);

    expect(resumen.ventanillasActivas).toBe(2);
    expect(resumen.ventanillasTotal).toBe(3);
  });

  it("agrega el inventario por medicamento y descarta los que tienen disponibilidad plena", () => {
    const medicamentos: Medicamento[] = [
      { id: "m1", codigoNacional: "C1", nombreGenerico: "Losartán", concentracion: "50 mg", presentacion: "Tabletas", laboratorioFabricante: "Lab A", requiereAutorizacion: false },
      { id: "m2", codigoNacional: "C2", nombreGenerico: "Acetaminofén", concentracion: "500 mg", presentacion: "Tabletas", laboratorioFabricante: "Lab B", requiereAutorizacion: false },
    ];
    function existencia(parcial: Partial<ExistenciaMedicamento>): ExistenciaMedicamento {
      return {
        id: "ex",
        puntoId: "p1",
        medicamentoId: "m1",
        lote: "L1",
        stockActual: 0,
        stockReservado: 0,
        cantidadDisponible: 0,
        disponible: false,
        fechaVencimiento: new Date("2027-01-01"),
        ...parcial,
      };
    }
    const existenciasPorPunto = [
      [existencia({ medicamentoId: "m1", puntoId: "p1", cantidadDisponible: 10 }), existencia({ medicamentoId: "m2", puntoId: "p1", cantidadDisponible: 500 })],
      [existencia({ medicamentoId: "m1", puntoId: "p2", cantidadDisponible: 0 })],
    ];

    const resumen = calcularResumen(entidades, servicios, [[], []], ahora, [], medicamentos, existenciasPorPunto);

    expect(resumen.inventarioCritico).toEqual([
      { medicamentoId: "m1", nombre: "Losartán 50 mg", unidades: 10, sedesConStock: 1, nivel: "BAJA" },
    ]);
  });
});
