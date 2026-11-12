import { describe, expect, it } from "vitest";
import { RESERVA_LISTA } from "./demo";

describe("datos de demo", () => {
  it("RESERVA_LISTA tiene la forma esperada", () => {
    expect(RESERVA_LISTA.vigenciaHoras).toBeGreaterThan(0);
    expect(RESERVA_LISTA.medicamentos).toBeTruthy();
  });
});
