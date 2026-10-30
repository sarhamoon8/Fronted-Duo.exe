import { describe, expect, it, vi, beforeEach } from "vitest";
import { AppError } from "@/core/domain/errors";
import { internalApi } from "../http/internal-client";
import { HttpAuthRepository } from "./auth.repository";

vi.mock("../http/internal-client", () => ({
  internalApi: { get: vi.fn(), post: vi.fn() },
}));

const sesion = { id: "u1", nombre: "Ana", email: "ana@example.com", rol: "PACIENTE" as const, expiraEn: null };

describe("HttpAuthRepository", () => {
  beforeEach(() => {
    vi.mocked(internalApi.get).mockReset();
    vi.mocked(internalApi.post).mockReset();
  });

  it("iniciarSesion llama a POST /auth/login y devuelve la sesión", async () => {
    vi.mocked(internalApi.post).mockResolvedValue({ data: { sesion } });
    const repo = new HttpAuthRepository();

    const resultado = await repo.iniciarSesion({ email: "ana@example.com", password: "clave123" });

    expect(internalApi.post).toHaveBeenCalledWith("/auth/login", {
      email: "ana@example.com",
      password: "clave123",
    });
    expect(resultado).toEqual(sesion);
  });

  it("registrarse llama a POST /auth/register y devuelve la sesión", async () => {
    vi.mocked(internalApi.post).mockResolvedValue({ data: { sesion } });
    const repo = new HttpAuthRepository();
    const datos = {
      numeroDocumento: "123",
      tipoDocumento: "CC",
      nombres: "Ana",
      apellidos: "Pérez",
      email: "ana@example.com",
      password: "clave123",
    };

    const resultado = await repo.registrarse(datos);

    expect(internalApi.post).toHaveBeenCalledWith("/auth/register", datos);
    expect(resultado).toEqual(sesion);
  });

  it("cerrarSesion llama a POST /auth/logout", async () => {
    vi.mocked(internalApi.post).mockResolvedValue({ data: undefined });
    const repo = new HttpAuthRepository();

    await repo.cerrarSesion();

    expect(internalApi.post).toHaveBeenCalledWith("/auth/logout");
  });

  it("obtenerSesion devuelve la sesión cuando hay una activa", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({ data: { sesion } });
    const repo = new HttpAuthRepository();

    await expect(repo.obtenerSesion()).resolves.toEqual(sesion);
  });

  it("obtenerSesion devuelve null ante un 401 (no autenticado), sin lanzar", async () => {
    vi.mocked(internalApi.get).mockRejectedValue(new AppError(["no autorizado"], 401));
    const repo = new HttpAuthRepository();

    await expect(repo.obtenerSesion()).resolves.toBeNull();
  });

  it("obtenerSesion relanza cualquier otro error (p. ej. 500)", async () => {
    const error = new AppError(["error del servidor"], 500);
    vi.mocked(internalApi.get).mockRejectedValue(error);
    const repo = new HttpAuthRepository();

    await expect(repo.obtenerSesion()).rejects.toBe(error);
  });
});
