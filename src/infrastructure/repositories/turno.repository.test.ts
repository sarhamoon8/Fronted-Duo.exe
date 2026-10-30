import { describe, expect, it, vi, beforeEach } from "vitest";
import { internalApi } from "../http/internal-client";
import { HttpTurnoRepository } from "./turno.repository";

vi.mock("../http/internal-client", () => ({
  internalApi: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

const turnoDto = {
  id: "t1",
  usuarioId: "u1",
  servicioId: "s1",
  puntoId: "p1",
  ventanillaId: null,
  codigoAlfanumerico: "T-ABC123",
  estado: "PENDIENTE",
  prioridad: false,
  posicion: 1,
  horaLlamado: null,
  horaFinalizacion: null,
  creadoEn: "2026-01-01T00:00:00.000Z",
};

describe("HttpTurnoRepository", () => {
  beforeEach(() => {
    vi.mocked(internalApi.get).mockReset();
    vi.mocked(internalApi.post).mockReset();
    vi.mocked(internalApi.patch).mockReset();
  });

  it("solicitar llama a POST /bff/turnos y mapea la respuesta (fechas como Date)", async () => {
    vi.mocked(internalApi.post).mockResolvedValue({ data: turnoDto });
    const repo = new HttpTurnoRepository();

    const resultado = await repo.solicitar("s1", "p1");

    expect(internalApi.post).toHaveBeenCalledWith("/bff/turnos", { servicioId: "s1", puntoId: "p1" });
    expect(resultado.estado).toBe("PENDIENTE");
    expect(resultado.creadoEn).toBeInstanceOf(Date);
    expect(resultado.horaLlamado).toBeNull();
  });

  it("cancelar llama a PATCH /bff/turnos/:id/cancelar", async () => {
    vi.mocked(internalApi.patch).mockResolvedValue({ data: { ...turnoDto, estado: "CANCELADO" } });
    const repo = new HttpTurnoRepository();

    const resultado = await repo.cancelar("t1");

    expect(internalApi.patch).toHaveBeenCalledWith("/bff/turnos/t1/cancelar");
    expect(resultado.estado).toBe("CANCELADO");
  });

  it("avanzar sin ventanillaId manda body vacío", async () => {
    vi.mocked(internalApi.patch).mockResolvedValue({ data: { ...turnoDto, estado: "ATENDIDO" } });
    const repo = new HttpTurnoRepository();

    await repo.avanzar("t1");

    expect(internalApi.patch).toHaveBeenCalledWith("/bff/turnos/t1/avanzar", {});
  });

  it("avanzar con ventanillaId lo manda en el body", async () => {
    vi.mocked(internalApi.patch).mockResolvedValue({ data: { ...turnoDto, estado: "EN_CURSO" } });
    const repo = new HttpTurnoRepository();

    await repo.avanzar("t1", "ventanilla-1");

    expect(internalApi.patch).toHaveBeenCalledWith("/bff/turnos/t1/avanzar", { ventanillaId: "ventanilla-1" });
  });

  it("listarPorPunto manda puntoId y, si se pasa, servicioId", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({ data: [turnoDto] });
    const repo = new HttpTurnoRepository();

    await repo.listarPorPunto("p1");
    expect(internalApi.get).toHaveBeenCalledWith("/bff/turnos", { params: { puntoId: "p1" } });

    await repo.listarPorPunto("p1", "s1");
    expect(internalApi.get).toHaveBeenCalledWith("/bff/turnos", { params: { puntoId: "p1", servicioId: "s1" } });
  });

  it("misTurnos llama a GET /bff/turnos/mis-turnos y mapea la lista", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({ data: [turnoDto] });
    const repo = new HttpTurnoRepository();

    const resultado = await repo.misTurnos();

    expect(internalApi.get).toHaveBeenCalledWith("/bff/turnos/mis-turnos");
    expect(resultado).toHaveLength(1);
    expect(resultado[0].creadoEn).toBeInstanceOf(Date);
  });
});
