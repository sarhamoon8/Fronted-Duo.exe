import { describe, expect, it } from "vitest";
import { fechaLarga, horaCorta, horaDeFranja, hoyColombia, sumarDias } from "./fecha-cita";

describe("fecha-cita", () => {
  it("hoyColombia usa la fecha de Colombia (UTC-5), no la UTC", () => {
    // 02:00 UTC del 18 todavía es 21:00 del 17 en Colombia.
    expect(hoyColombia(new Date("2026-11-18T02:00:00.000Z"))).toBe("2026-11-17");
    expect(hoyColombia(new Date("2026-11-17T15:00:00.000Z"))).toBe("2026-11-17");
  });

  it("sumarDias cruza meses y años", () => {
    expect(sumarDias("2026-11-17", 60)).toBe("2027-01-16");
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(sumarDias("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("formatea fecha y hora en hora de Colombia", () => {
    const instante = new Date("2026-11-17T14:30:00.000Z"); // 09:30 en Colombia
    expect(fechaLarga(instante)).toContain("17");
    expect(fechaLarga(instante).toLowerCase()).toContain("noviembre");
    expect(horaCorta(instante)).toMatch(/9:30/);
  });

  it("horaDeFranja pasa HH:mm a formato de 12 horas", () => {
    expect(horaDeFranja("08:00")).toBe("8:00 a. m.");
    expect(horaDeFranja("12:30")).toBe("12:30 p. m.");
    expect(horaDeFranja("00:15")).toBe("12:15 a. m.");
    expect(horaDeFranja("17:00")).toBe("5:00 p. m.");
  });
});
