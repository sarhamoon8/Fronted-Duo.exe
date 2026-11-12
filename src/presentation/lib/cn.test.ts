import { describe, expect, it } from "vitest";
import {
  cn,
  enmascararEmail,
  esHoy,
  fechaCorta,
  fechaLarga,
  formatearFechaHora,
  formatearHora,
  haceCuanto,
  minutosDesde,
  saludo,
} from "./cn";

describe("cn", () => {
  it("une clases ignorando valores falsy", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("devuelve cadena vacía sin clases", () => {
    expect(cn()).toBe("");
  });
});

describe("formatearFechaHora / formatearHora", () => {
  it("acepta Date y string ISO", () => {
    const d = new Date("2026-01-15T10:30:00Z");
    expect(typeof formatearFechaHora(d)).toBe("string");
    expect(typeof formatearFechaHora(d.toISOString())).toBe("string");
    expect(typeof formatearHora(d)).toBe("string");
  });
});

describe("fechaLarga / fechaCorta", () => {
  it("capitaliza el primer caracter", () => {
    const s = fechaLarga(new Date("2026-03-20T12:00:00Z"));
    expect(s[0]).toBe(s[0].toUpperCase());
  });

  it("no deja punto final en el mes abreviado", () => {
    const s = fechaCorta(new Date("2026-03-20T12:00:00Z"));
    expect(s.includes(".")).toBe(false);
  });
});

describe("horaBogota / saludo", () => {
  it("saluda según la hora: mañana, tarde, noche", () => {
    expect(saludo(new Date("2026-01-15T07:00:00-05:00"))).toBe("Buenos días");
    expect(saludo(new Date("2026-01-15T14:00:00-05:00"))).toBe("Buenas tardes");
    expect(saludo(new Date("2026-01-15T21:00:00-05:00"))).toBe("Buenas noches");
  });
});

describe("esHoy", () => {
  it("es true para la fecha actual y false para una pasada", () => {
    expect(esHoy(new Date())).toBe(true);
    expect(esHoy("2000-01-01T00:00:00Z")).toBe(false);
  });
});

describe("minutosDesde", () => {
  it("calcula minutos transcurridos y nunca es negativo", () => {
    const ahora = Date.parse("2026-01-15T10:30:00Z");
    expect(minutosDesde("2026-01-15T10:00:00Z", ahora)).toBe(30);
    expect(minutosDesde("2026-01-15T11:00:00Z", ahora)).toBe(0);
  });
});

describe("haceCuanto", () => {
  const ahora = Date.parse("2026-01-15T10:30:00Z");

  it("hace un momento para menos de 10s", () => {
    expect(haceCuanto(new Date(ahora - 5_000), ahora)).toBe("hace un momento");
  });

  it("segundos para menos de 60s", () => {
    expect(haceCuanto(new Date(ahora - 30_000), ahora)).toBe("hace 30 s");
  });

  it("minutos para menos de 60min", () => {
    expect(haceCuanto(new Date(ahora - 5 * 60_000), ahora)).toBe("hace 5 min");
  });

  it("horas para 60min o más", () => {
    expect(haceCuanto(new Date(ahora - 3 * 60 * 60_000), ahora)).toBe("hace 3 h");
  });
});

describe("enmascararEmail", () => {
  it("enmascara dejando la primera letra y el dominio", () => {
    expect(enmascararEmail("maria.perez@correo.co")).toBe("m•••••@correo.co");
  });
});
