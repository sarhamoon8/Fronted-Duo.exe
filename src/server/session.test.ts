import { describe, expect, it, vi, beforeEach } from "vitest";

const cookiesGetMock = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: cookiesGetMock })),
}));

const backendGetMock = vi.fn();
vi.mock("./backend-client", () => ({
  crearBackendClient: vi.fn(() => ({ get: backendGetMock })),
}));

const { leerToken, construirSesion, opcionesCookie, maxAgeDesdeToken, COOKIE_MAX_AGE_POR_DEFECTO } =
  await import("./session");

function crearJwtFalso(payload: Record<string, unknown>): string {
  const codificar = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64");
  return `${codificar({ alg: "HS256" })}.${codificar(payload)}.firma-falsa`;
}

const payloadValido = { sub: "usuario-1", email: "ana@example.com", rol: "PACIENTE", exp: 9999999999 };

describe("leerToken", () => {
  beforeEach(() => {
    cookiesGetMock.mockReset();
  });

  it("devuelve el valor de la cookie cuando existe", async () => {
    cookiesGetMock.mockReturnValue({ value: "token-123" });
    await expect(leerToken()).resolves.toBe("token-123");
  });

  it("devuelve null cuando la cookie no existe", async () => {
    cookiesGetMock.mockReturnValue(undefined);
    await expect(leerToken()).resolves.toBeNull();
  });
});

describe("opcionesCookie", () => {
  it("siempre es httpOnly, sameSite lax y path raíz", () => {
    const opciones = opcionesCookie(3600);
    expect(opciones.httpOnly).toBe(true);
    expect(opciones.sameSite).toBe("lax");
    expect(opciones.path).toBe("/");
    expect(opciones.maxAge).toBe(3600);
  });
});

describe("maxAgeDesdeToken", () => {
  it("usa el valor por defecto si el token no decodifica (inválido)", () => {
    expect(maxAgeDesdeToken("token-invalido")).toBe(COOKIE_MAX_AGE_POR_DEFECTO);
  });

  it("calcula los segundos restantes hasta exp", () => {
    const exp = Math.floor(Date.now() / 1000) + 120;
    const maxAge = maxAgeDesdeToken(crearJwtFalso({ ...payloadValido, exp }));
    expect(maxAge).toBeGreaterThan(110);
    expect(maxAge).toBeLessThanOrEqual(120);
  });

  it("nunca devuelve un valor negativo para un token ya expirado", () => {
    const exp = Math.floor(Date.now() / 1000) - 120;
    expect(maxAgeDesdeToken(crearJwtFalso({ ...payloadValido, exp }))).toBe(0);
  });
});

describe("construirSesion", () => {
  beforeEach(() => {
    backendGetMock.mockReset();
  });

  it("devuelve null si el token no decodifica", async () => {
    await expect(construirSesion("token-invalido")).resolves.toBeNull();
  });

  it("devuelve null si el token ya expiró", async () => {
    const exp = Math.floor(Date.now() / 1000) - 3600;
    await expect(construirSesion(crearJwtFalso({ ...payloadValido, exp }))).resolves.toBeNull();
  });

  it("completa el nombre con GET /usuarios/:id cuando el backend responde 200", async () => {
    backendGetMock.mockResolvedValue({ status: 200, data: { nombres: "Ana", apellidos: "Pérez" } });

    const sesion = await construirSesion(crearJwtFalso(payloadValido));

    expect(sesion?.nombre).toBe("Ana Pérez");
  });

  it("devuelve null si el backend responde 401 (token rechazado)", async () => {
    backendGetMock.mockResolvedValue({ status: 401, data: {} });

    await expect(construirSesion(crearJwtFalso(payloadValido))).resolves.toBeNull();
  });

  it("si el backend está caído, sigue con los datos del token (no rompe la UI)", async () => {
    backendGetMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const sesion = await construirSesion(crearJwtFalso(payloadValido));

    expect(sesion?.id).toBe("usuario-1");
    expect(sesion?.nombre).toBe("ana"); // cae al prefijo del email, sin nombre completo
  });
});
