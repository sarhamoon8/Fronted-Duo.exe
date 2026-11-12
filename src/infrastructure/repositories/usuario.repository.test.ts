import { describe, expect, it, vi, beforeEach } from "vitest";
import { internalApi } from "../http/internal-client";
import { HttpUsuarioRepository } from "./usuario.repository";

vi.mock("../http/internal-client", () => ({
  internalApi: { get: vi.fn(), post: vi.fn() },
}));

const usuarioDto = {
  id: "u1",
  numeroDocumento: "123",
  tipoDocumento: "CC",
  nombres: "Ana",
  apellidos: "Pérez",
  email: "ana@example.com",
  telefono: null,
  rol: "PACIENTE",
  creadoEn: "2026-01-01T00:00:00.000Z",
};

describe("HttpUsuarioRepository", () => {
  beforeEach(() => {
    vi.mocked(internalApi.get).mockReset();
    vi.mocked(internalApi.post).mockReset();
  });

  it("listar llama a GET /bff/usuarios y mapea creadoEn a Date", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({ data: [usuarioDto] });
    const repo = new HttpUsuarioRepository();

    const resultado = await repo.listar();

    expect(internalApi.get).toHaveBeenCalledWith("/bff/usuarios");
    expect(resultado[0].creadoEn).toBeInstanceOf(Date);
    expect(resultado[0].rol).toBe("PACIENTE");
  });

  it("crear llama a POST /bff/usuarios con los datos y mapea la respuesta", async () => {
    vi.mocked(internalApi.post).mockResolvedValue({ data: usuarioDto });
    const repo = new HttpUsuarioRepository();
    const datos = {
      numeroDocumento: "123",
      tipoDocumento: "CC",
      nombres: "Ana",
      apellidos: "Pérez",
      email: "ana@example.com",
      password: "clave123",
    };

    const resultado = await repo.crear(datos);

    expect(internalApi.post).toHaveBeenCalledWith("/bff/usuarios", datos);
    expect(resultado.id).toBe("u1");
    expect(resultado.creadoEn).toBeInstanceOf(Date);
  });
});
