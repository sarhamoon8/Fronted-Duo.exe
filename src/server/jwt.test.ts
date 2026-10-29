import { describe, expect, it } from "vitest";
import type { JwtPayload } from "@/core/domain/entities/sesion";
import { decodificarJwt, sesionDesdePayload, tokenExpirado } from "./jwt";

/**
 * decodificarJwt no verifica firma (esa responsabilidad es del backend), así
 * que para probarlo basta construir un JWT con el mismo formato de 3 partes
 * separadas por "." y un payload base64 válido — la firma puede ser
 * cualquier texto.
 */
function crearJwtFalso(payload: object): string {
  const codificar = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64");
  return `${codificar({ alg: "HS256", typ: "JWT" })}.${codificar(payload)}.firma-falsa`;
}

const payloadValido: JwtPayload = {
  sub: "usuario-1",
  email: "ana@example.com",
  rol: "PACIENTE",
  exp: 9999999999,
};

describe("decodificarJwt", () => {
  it("decodifica un payload válido", () => {
    const resultado = decodificarJwt(crearJwtFalso(payloadValido));
    expect(resultado).toEqual(payloadValido);
  });

  it("devuelve null si falta sub", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sub, ...sinSub } = payloadValido;
    expect(decodificarJwt(crearJwtFalso(sinSub))).toBeNull();
  });

  it("devuelve null si falta email", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, ...sinEmail } = payloadValido;
    expect(decodificarJwt(crearJwtFalso(sinEmail))).toBeNull();
  });

  it("devuelve null si el rol no es uno de los roles válidos", () => {
    expect(decodificarJwt(crearJwtFalso({ ...payloadValido, rol: "SUPERADMIN" }))).toBeNull();
  });

  it("devuelve null ante un token malformado (sin las 3 partes)", () => {
    expect(decodificarJwt("no-es-un-jwt")).toBeNull();
  });

  it("devuelve null ante un payload que no es JSON válido", () => {
    expect(decodificarJwt("header.no-es-base64-json-valido.firma")).toBeNull();
  });
});

describe("tokenExpirado", () => {
  it("es false si el payload no trae exp", () => {
    expect(tokenExpirado({ sub: "u1", email: "a@b.com", rol: "PACIENTE" })).toBe(false);
  });

  it("es false si exp está en el futuro (más allá del margen)", () => {
    const payload: JwtPayload = {
      sub: "u1",
      email: "a@b.com",
      rol: "PACIENTE",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    expect(tokenExpirado(payload)).toBe(false);
  });

  it("es true si exp ya pasó", () => {
    const payload: JwtPayload = {
      sub: "u1",
      email: "a@b.com",
      rol: "PACIENTE",
      exp: Math.floor(Date.now() / 1000) - 3600,
    };
    expect(tokenExpirado(payload)).toBe(true);
  });

  it("respeta el margen de seguridad (expira 'antes' por el margen)", () => {
    const ahora = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = { sub: "u1", email: "a@b.com", rol: "PACIENTE", exp: ahora + 3 };
    expect(tokenExpirado(payload, 5)).toBe(true);
  });
});

describe("sesionDesdePayload", () => {
  it("usa el nombre explícito cuando se pasa", () => {
    const sesion = sesionDesdePayload(payloadValido, "Ana Pérez");
    expect(sesion).toEqual({
      id: "usuario-1",
      email: "ana@example.com",
      rol: "PACIENTE",
      nombre: "Ana Pérez",
      expiraEn: 9999999999000,
    });
  });

  it("cae al prefijo del email como nombre cuando no se pasa uno explícito", () => {
    const sesion = sesionDesdePayload(payloadValido);
    expect(sesion.nombre).toBe("ana");
  });

  it("expiraEn es null cuando el payload no trae exp", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exp, ...sinExp } = payloadValido;
    const sesion = sesionDesdePayload(sinExp as JwtPayload);
    expect(sesion.expiraEn).toBeNull();
  });
});
