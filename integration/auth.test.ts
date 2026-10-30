import { describe, expect, it } from "vitest";

const BASE = "http://localhost:3001";
const COOKIE_NAME = "filacero_token";
const PACIENTE = { email: "paciente@filacero.demo", password: "FilaCero2026!" };

function extraerCookie(respuesta: Response): string | null {
  const crudas = respuesta.headers.getSetCookie();
  const propia = crudas.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  return propia ? propia.split(";")[0] : null;
}

describe("POST /api/auth/login (contra el backend real)", () => {
  it("con credenciales válidas devuelve la sesión y una cookie httpOnly", async () => {
    const respuesta = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(PACIENTE),
    });

    expect(respuesta.status).toBe(200);
    const cuerpo = await respuesta.json();
    expect(cuerpo.sesion.email).toBe(PACIENTE.email);
    expect(cuerpo.sesion.rol).toBe("PACIENTE");
    expect(cuerpo).not.toHaveProperty("accessToken"); // el JWT nunca llega al navegador

    const cookie = extraerCookie(respuesta);
    expect(cookie).toBeTruthy();
    const crudas = respuesta.headers.getSetCookie();
    expect(crudas.find((c) => c.startsWith(COOKIE_NAME))).toMatch(/HttpOnly/i);
  });

  it("con credenciales inválidas reenvía el 401 del backend tal cual, sin cookie", async () => {
    const respuesta = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: PACIENTE.email, password: "contraseña-incorrecta" }),
    });

    expect(respuesta.status).toBe(401);
    expect(extraerCookie(respuesta)).toBeNull();
  });

  it("con un cuerpo JSON inválido responde 400 sin tocar al backend", async () => {
    const respuesta = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "esto no es json{{{",
    });

    expect(respuesta.status).toBe(400);
  });
});

describe("GET /api/auth/session", () => {
  it("sin cookie responde 401", async () => {
    const respuesta = await fetch(`${BASE}/api/auth/session`);
    expect(respuesta.status).toBe(401);
  });

  it("con una cookie inválida responde 401 y la limpia", async () => {
    const respuesta = await fetch(`${BASE}/api/auth/session`, {
      headers: { Cookie: `${COOKIE_NAME}=token-basura-no-es-un-jwt` },
    });

    expect(respuesta.status).toBe(401);
    const limpieza = respuesta.headers.getSetCookie().find((c) => c.startsWith(COOKIE_NAME));
    expect(limpieza).toMatch(/Max-Age=0/i);
  });

  it("con una cookie válida (recién emitida por login) devuelve la sesión", async () => {
    const login = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(PACIENTE),
    });
    const cookie = extraerCookie(login)!;

    const respuesta = await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: cookie } });

    expect(respuesta.status).toBe(200);
    const cuerpo = await respuesta.json();
    expect(cuerpo.sesion.email).toBe(PACIENTE.email);
  });
});

describe("POST /api/auth/logout", () => {
  it("responde 204 y limpia la cookie (el backend no tiene endpoint de logout: JWT sin estado)", async () => {
    const respuesta = await fetch(`${BASE}/api/auth/logout`, { method: "POST" });

    expect(respuesta.status).toBe(204);
    const limpieza = respuesta.headers.getSetCookie().find((c) => c.startsWith(COOKIE_NAME));
    expect(limpieza).toMatch(/Max-Age=0/i);
  });
});
