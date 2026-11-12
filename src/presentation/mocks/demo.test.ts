import { describe, expect, it } from "vitest";
import {
  ESTADO_RED,
  FORMULA_ACTIVA,
  INVENTARIO_CRITICO,
  PROXIMA_CITA,
  RESERVA_LISTA,
  SEDES_FARMACIA,
} from "./demo";

describe("datos de demo", () => {
  it("FORMULA_ACTIVA trae al menos un medicamento", () => {
    expect(FORMULA_ACTIVA.medicamentos.length).toBeGreaterThan(0);
  });

  it("SEDES_FARMACIA e INVENTARIO_CRITICO no están vacíos", () => {
    expect(SEDES_FARMACIA.length).toBeGreaterThan(0);
    expect(INVENTARIO_CRITICO.length).toBeGreaterThan(0);
  });

  it("RESERVA_LISTA, PROXIMA_CITA y ESTADO_RED tienen la forma esperada", () => {
    expect(RESERVA_LISTA.vigenciaHoras).toBeGreaterThan(0);
    expect(PROXIMA_CITA.fecha).toBeTruthy();
    expect(ESTADO_RED.alertas).toBeGreaterThanOrEqual(0);
  });
});
