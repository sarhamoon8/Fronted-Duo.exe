import { beforeAll, describe, expect, it } from "vitest";

const BASE = "http://localhost:3001";
const COOKIE_NAME = "filacero_token";
const PACIENTE = { email: "paciente@filacero.demo", password: "FilaCero2026!" };

let cookiePaciente: string;

beforeAll(async () => {
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(PACIENTE),
  });
  const cruda = login.headers.getSetCookie().find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!cruda) throw new Error("No se pudo iniciar sesión para las pruebas del BFF (¿corrió db:seed?).");
  cookiePaciente = cruda.split(";")[0];
});

describe("GET /api/bff/[...path] (proxy hacia el backend real)", () => {
  it("sin cookie responde el 401 del backend", async () => {
    const respuesta = await fetch(`${BASE}/api/bff/turnos/mis-turnos`);
    expect(respuesta.status).toBe(401);
  });

  it("con una cookie válida reenvía la petición y devuelve la respuesta real del backend", async () => {
    const respuesta = await fetch(`${BASE}/api/bff/turnos/mis-turnos`, {
      headers: { Cookie: cookiePaciente },
    });

    expect(respuesta.status).toBe(200);
    const cuerpo = await respuesta.json();
    expect(Array.isArray(cuerpo)).toBe(true);
  });

  it("con un token rechazado por el backend (401), limpia la cookie", async () => {
    const respuesta = await fetch(`${BASE}/api/bff/turnos/mis-turnos`, {
      headers: { Cookie: `${COOKIE_NAME}=un-token-con-formato-invalido` },
    });

    expect(respuesta.status).toBe(401);
    const limpieza = respuesta.headers.getSetCookie().find((c) => c.startsWith(COOKIE_NAME));
    expect(limpieza).toMatch(/Max-Age=0/i);
  });

  it("un recurso fuera de la lista permitida responde 404 sin llegar al backend", async () => {
    const respuesta = await fetch(`${BASE}/api/bff/logs`, {
      headers: { Cookie: cookiePaciente },
    });

    expect(respuesta.status).toBe(404);
    const cuerpo = await respuesta.json();
    expect(cuerpo.message).toBe("Recurso no disponible");
  });

  it("GET a un recurso permitido pero público no exige cookie (reenvía igual)", async () => {
    const respuesta = await fetch(`${BASE}/api/bff/servicios`);
    expect(respuesta.status).toBe(200);
  });

  it("una mutación con Origin distinto al propio se rechaza por CSRF (403)", async () => {
    const respuesta = await fetch(`${BASE}/api/bff/turnos`, {
      method: "POST",
      headers: {
        Cookie: cookiePaciente,
        "Content-Type": "application/json",
        Origin: "https://sitio-malicioso.example",
      },
      body: JSON.stringify({ servicioId: "x", puntoId: "y" }),
    });

    expect(respuesta.status).toBe(403);
    const cuerpo = await respuesta.json();
    expect(cuerpo.message).toBe("Origen no permitido");
  });

  it("una mutación con el Origin propio (o sin Origin) sí se reenvía al backend", async () => {
    // Sin servicioId/puntoId válidos el backend responde 400, no 403 — lo
    // que importa aquí es que pasó el filtro CSRF y llegó al backend real.
    const respuesta = await fetch(`${BASE}/api/bff/turnos`, {
      method: "POST",
      headers: { Cookie: cookiePaciente, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(respuesta.status).not.toBe(403);
  });
});
