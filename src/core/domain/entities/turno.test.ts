import { describe, expect, it } from "vitest";
import {
  codigoCorto,
  codigoTurno,
  estaActivo,
  estimarEspera,
  puedeAvanzar,
  puedeCancelar,
  siguienteEstado,
} from "./turno";

describe("siguienteEstado", () => {
  it("PENDIENTE -> EN_CURSO -> ATENDIDO -> null", () => {
    expect(siguienteEstado("PENDIENTE")).toBe("EN_CURSO");
    expect(siguienteEstado("EN_CURSO")).toBe("ATENDIDO");
    expect(siguienteEstado("ATENDIDO")).toBeNull();
  });

  it("CANCELADO no tiene siguiente estado", () => {
    expect(siguienteEstado("CANCELADO")).toBeNull();
  });
});

describe("puedeAvanzar", () => {
  it("es true para PENDIENTE y EN_CURSO", () => {
    expect(puedeAvanzar("PENDIENTE")).toBe(true);
    expect(puedeAvanzar("EN_CURSO")).toBe(true);
  });

  it("es false para ATENDIDO y CANCELADO", () => {
    expect(puedeAvanzar("ATENDIDO")).toBe(false);
    expect(puedeAvanzar("CANCELADO")).toBe(false);
  });
});

describe("puedeCancelar", () => {
  it("es true solo para PENDIENTE y EN_CURSO", () => {
    expect(puedeCancelar("PENDIENTE")).toBe(true);
    expect(puedeCancelar("EN_CURSO")).toBe(true);
  });

  it("es false para ATENDIDO y CANCELADO (regla del backend)", () => {
    expect(puedeCancelar("ATENDIDO")).toBe(false);
    expect(puedeCancelar("CANCELADO")).toBe(false);
  });
});

describe("estaActivo", () => {
  it("es true solo para PENDIENTE y EN_CURSO", () => {
    expect(estaActivo("PENDIENTE")).toBe(true);
    expect(estaActivo("EN_CURSO")).toBe(true);
    expect(estaActivo("ATENDIDO")).toBe(false);
    expect(estaActivo("CANCELADO")).toBe(false);
  });
});

describe("codigoCorto", () => {
  it("deriva un código de 6 caracteres en mayúscula a partir del id, sin guiones", () => {
    expect(codigoCorto("ab12cd34-ef56-7890-ab12-cd34ef567890")).toBe("T-AB12CD");
  });
});

describe("codigoTurno", () => {
  it("prefiere el código alfanumérico real del backend cuando existe", () => {
    expect(codigoTurno({ id: "id-1", codigoAlfanumerico: "T-8K3PQ2" })).toBe("T-8K3PQ2");
  });

  it("cae al código derivado del id cuando no hay codigoAlfanumerico", () => {
    expect(codigoTurno({ id: "ab12cd34-ef56-7890-ab12-cd34ef567890", codigoAlfanumerico: "" })).toBe(
      "T-AB12CD",
    );
  });
});

describe("estimarEspera", () => {
  it("devuelve null cuando no hay posición (no está en fila)", () => {
    expect(estimarEspera(null)).toBeNull();
  });

  it("el siguiente en la fila (posición 1) espera 0 minutos", () => {
    expect(estimarEspera(1)).toBe(0);
  });

  it("multiplica (posicion - 1) por los minutos promedio por turno", () => {
    expect(estimarEspera(4)).toBe(18); // (4-1) * 6
  });
});
